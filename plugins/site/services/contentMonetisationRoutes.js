// contentMonetisationRoutes.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const db = new Pool({ connectionString: process.env.DATABASE_URL });
const s3 = new S3Client({ region: process.env.AWS_REGION });

// ─── 1. POST CREATION ───
router.post('/posts', async (req, res) => {
    const { mistressId, title, caption, postType, priceCredits, requiredTierId } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO content_posts (mistress_id, title, caption, post_type, price_credits, required_tier_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [mistressId, title, caption, postType, priceCredits, requiredTierId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 2. MEDIA PRESIGN UPLOAD ───
router.post('/media/presign', async (req, res) => {
    const { fileName, contentType, postId } = req.body;
    const key = `content/${postId}/${Date.now()}_${fileName}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType
    });

    try {
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        // Log pending media
        await db.query(`INSERT INTO content_media (post_id, s3_key, media_type) VALUES ($1, $2, $3)`, 
            [postId, key, contentType.split('/')[0]]);
        res.json({ uploadUrl, key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 3. PPV PURCHASE (Stripe) ───
router.post('/purchase/ppv', async (req, res) => {
    const { subId, postId } = req.body;
    try {
        const postRes = await db.query('SELECT * FROM content_posts WHERE id = $1', [postId]);
        const post = postRes.rows[0];
        if (!post) return res.status(404).send('Post not found');

        const amountUSD = Math.round(post.price_credits * 10); // 1cr = $0.10

        const intent = await stripe.paymentIntents.create({
            amount: amountUSD,
            currency: 'usd',
            metadata: { type: 'ppv_purchase', sub_id: subId, post_id: postId },
            transfer_data: {
                destination: await getMistressStripeAccount(post.mistress_id),
                amount: Math.round(amountUSD * 0.70)
            }
        });
        res.json({ clientSecret: intent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 4. TIER SUBSCRIPTION (Stripe) ───
router.post('/purchase/subscribe', async (req, res) => {
    const { subId, tierId } = req.body;
    try {
        const tierRes = await db.query('SELECT * FROM subscription_tiers WHERE id = $1', [tierId]);
        const tier = tierRes.rows[0];

        // Use Stripe Billing/Subscriptions for recurring
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: tier.stripe_price_id, quantity: 1 }],
            success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/cancel`,
            metadata: { sub_id: subId, tier_id: tierId, mistress_id: tier.mistress_id },
            subscription_data: {
                transfer_data: {
                    destination: await getMistressStripeAccount(tier.mistress_id),
                    amount_percent: 70
                }
            }
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function getMistressStripeAccount(id) {
    const { rows } = await db.query('SELECT stripe_account_id FROM users WHERE id = $1', [id]);
    return rows[0].stripe_account_id;
}

module.exports = router;

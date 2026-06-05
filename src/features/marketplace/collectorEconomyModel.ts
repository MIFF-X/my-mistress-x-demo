export type CollectorWorldKind =
  | 'vending'
  | 'laundry'
  | 'personal'
  | 'ppv'
  | 'style'
  | 'stickers'
  | 'custom';

export type CollectorWorldPlan = {
  id: CollectorWorldKind;
  title: string;
  badge: string;
  description: string;
  buyerRule: string;
  sellerRule: string;
  stockRule: string;
  tone: string;
  checklist: string[];
};

export type CollectorOrderState = {
  id: string;
  title: string;
  description: string;
  owner: 'buyer' | 'seller' | 'system' | 'admin';
  tone: string;
};

export type CollectorUnlockRule = {
  id: string;
  title: string;
  trigger: string;
  reward: string;
  audit: string;
  tone: string;
};

export type CollectorRiskRule = {
  id: string;
  title: string;
  description: string;
  route: string;
  tone: string;
};

export const COLLECTOR_WORLD_PLANS: CollectorWorldPlan[] = [
  {
    id: 'vending',
    title: 'Vending Machine',
    badge: 'DROP',
    description: 'Fast-drop world for limited digital or physical items with clear stock, reveal and sell-out states.',
    buyerRule: 'Buyer can purchase immediately when stock is available.',
    sellerRule: 'Creator controls stock, price, reveal mode and restock timing.',
    stockRule: 'Strict stock count with sold-out and reserved states.',
    tone: '#d4af37',
    checklist: ['Stock counter', 'Fast purchase', 'Sold-out state', 'Restock note', 'Receipt'],
  },
  {
    id: 'laundry',
    title: 'Laundry Hamper',
    badge: 'HAMPER',
    description: 'Personal-item style product grouping with approval, privacy copy, fulfilment notes and policy review hooks.',
    buyerRule: 'Buyer requests approval before payment for sensitive physical items.',
    sellerRule: 'Creator reviews request, approves payment, fulfils with private seller notes.',
    stockRule: 'Manual stock plus privacy and fulfilment warnings.',
    tone: '#f97316',
    checklist: ['Approval gate', 'Privacy warning', 'Seller notes', 'Tracking handoff', 'Policy review'],
  },
  {
    id: 'personal',
    title: 'Personal Items',
    badge: 'VAULT',
    description: 'Signed items, keepsakes, cards and personal merch with controlled visibility and fulfilment safeguards.',
    buyerRule: 'Buyer can request, pay or reserve depending on item rules.',
    sellerRule: 'Creator manages naming, media, stock, fulfilment and buyer communication.',
    stockRule: 'Physical stock with optional manual approval.',
    tone: '#f472b6',
    checklist: ['Restricted visibility', 'Reserve interest', 'Approval state', 'Shipment note', 'Dispute route'],
  },
  {
    id: 'ppv',
    title: 'PPV / Content',
    badge: 'UNLOCK',
    description: 'Digital unlock world for PPV clips, content packs, replay access and related sticker rewards.',
    buyerRule: 'Buyer unlocks content after payment or membership rule passes.',
    sellerRule: 'Creator assigns access window, preview and reward hooks.',
    stockRule: 'Unlimited digital stock with entitlement expiry.',
    tone: '#60a5fa',
    checklist: ['Preview', 'Entitlement', 'Expiry', 'Replay access', 'Content receipt'],
  },
  {
    id: 'style',
    title: 'Style Packs',
    badge: 'STYLE',
    description: 'Theme, layout and UI pack commerce that connects marketplace purchases to installed style state.',
    buyerRule: 'Buyer or creator unlocks free, premium or custom style packs.',
    sellerRule: 'Admin controls licensing, installed state, import/export and reset actions.',
    stockRule: 'Digital license with active/included/locked state.',
    tone: '#c084fc',
    checklist: ['License check', 'Install state', 'Custom request', 'Export', 'Reset'],
  },
  {
    id: 'stickers',
    title: 'Sticker Rewards',
    badge: 'REWARD',
    description: 'Sticker packs and item-matched sticker unlocks attached to purchases, goals and collection milestones.',
    buyerRule: 'Buyer receives stickers when purchase trigger and eligibility match.',
    sellerRule: 'Creator or admin maps products to sticker rewards.',
    stockRule: 'Digital reward ledger with collection display.',
    tone: '#a3e635',
    checklist: ['Trigger map', 'Reward preview', 'Eligibility', 'Collection ledger', 'Profile display'],
  },
  {
    id: 'custom',
    title: 'Custom Orders',
    badge: 'QUOTE',
    description: 'Custom quote and commission flow for buyer requests, seller pricing, fulfilment notes and dispute-safe receipts.',
    buyerRule: 'Buyer submits brief, budget and contact preference before payment.',
    sellerRule: 'Creator prices, accepts, prepares and marks fulfilment states.',
    stockRule: 'Made-to-order with quote approval and delivery status.',
    tone: '#1D9E75',
    checklist: ['Brief', 'Quote', 'Approval', 'Delivery note', 'Refund path'],
  },
];

export const COLLECTOR_ORDER_STATES: CollectorOrderState[] = [
  {
    id: 'draft',
    title: 'Draft',
    description: 'Buyer or seller is composing a product, quote or request before it enters the order queue.',
    owner: 'buyer',
    tone: '#777',
  },
  {
    id: 'pending-approval',
    title: 'Pending Approval',
    description: 'Creator reviews a buyer request before the platform allows payment.',
    owner: 'seller',
    tone: '#f5c542',
  },
  {
    id: 'awaiting-payment',
    title: 'Awaiting Payment',
    description: 'Request was approved and waits for buyer payment or wallet confirmation.',
    owner: 'buyer',
    tone: '#d4af37',
  },
  {
    id: 'paid',
    title: 'Paid',
    description: 'Payment completed, receipt exists and fulfilment can begin.',
    owner: 'system',
    tone: '#60a5fa',
  },
  {
    id: 'preparing',
    title: 'Preparing',
    description: 'Seller is packing, creating, verifying or preparing delivery.',
    owner: 'seller',
    tone: '#f97316',
  },
  {
    id: 'fulfilled',
    title: 'Fulfilled',
    description: 'Seller marked the order fulfilled, delivered, shipped or ready for pickup.',
    owner: 'seller',
    tone: '#1D9E75',
  },
  {
    id: 'disputed',
    title: 'Disputed',
    description: 'Buyer, seller or admin needs review, evidence, refund or support action.',
    owner: 'admin',
    tone: '#ef4444',
  },
  {
    id: 'refunded',
    title: 'Refunded',
    description: 'Refund has been recorded and collection/reward effects need reconciliation.',
    owner: 'system',
    tone: '#f472b6',
  },
];

export const COLLECTOR_UNLOCK_RULES: CollectorUnlockRule[] = [
  {
    id: 'item-match',
    title: 'Item-matched Sticker',
    trigger: 'Qualifying product purchase by item id or world.',
    reward: 'Unlock themed sticker for buyer inventory and profile display.',
    audit: 'Records product id, order id, sticker id and unlock reason.',
    tone: '#a3e635',
  },
  {
    id: 'world-completion',
    title: 'World Completion Badge',
    trigger: 'Buyer completes a set of purchases inside one marketplace world.',
    reward: 'Collector badge and optional tier progress.',
    audit: 'Records world, completed count and badge rule.',
    tone: '#d4af37',
  },
  {
    id: 'custom-order',
    title: 'Custom Order Keepsake',
    trigger: 'Custom quote is paid and fulfilled.',
    reward: 'Keepsake sticker or card tied to the custom order receipt.',
    audit: 'Records quote, fulfilment state and receipt reference.',
    tone: '#1D9E75',
  },
  {
    id: 'replay-content',
    title: 'Content Pack Reward',
    trigger: 'PPV/content purchase or replay unlock completes.',
    reward: 'Related sticker, collection slot or replay badge.',
    audit: 'Records content entitlement and reward expiry if any.',
    tone: '#60a5fa',
  },
];

export const COLLECTOR_RISK_RULES: CollectorRiskRule[] = [
  {
    id: 'privacy',
    title: 'Private Fulfilment Data',
    description: 'Shipping, personal notes and buyer details stay private to the seller/admin fulfilment context.',
    route: 'Marketplace order fulfilment controls',
    tone: '#f5c542',
  },
  {
    id: 'prohibited',
    title: 'Sensitive Goods Review',
    description: 'Laundry/personal-item worlds require policy review, privacy copy and prohibited-item screening.',
    route: 'Approval-gated worlds',
    tone: '#ef4444',
  },
  {
    id: 'refunds',
    title: 'Disputes and Refunds',
    description: 'Refund states need receipt reconciliation, reward revocation rules and support notes.',
    route: 'Seller orders and admin queue',
    tone: '#f97316',
  },
  {
    id: 'visibility',
    title: 'Collector Visibility',
    description: 'Owned items, badges and stickers should default to user-controlled display settings.',
    route: 'Inventory and profile showcase',
    tone: '#c084fc',
  },
];

export const COLLECTOR_ECONOMY_PIPELINE = [
  'Choose world and product rules',
  'Buyer request or purchase',
  'Approval and wallet settlement',
  'Seller preparation and fulfilment',
  'Sticker or collectible unlock',
  'Receipt, dispute and refund reconciliation',
];

// Subscription & Content Posting Plugin for Mistress-X Platform  
  
const express = require('express');  
const router = express.Router();  
  
// In-memory data stores (replace with DB in production)  
let creators = [];  
let posts = [];  
let subscriptions = [];  
  
// Data Models (simplified)  
// Creator: { id, name, profile, subscriptionPrice }  
// Post: { id, creatorId, type: 'photo'|'video'|'text', contentUrl, caption, createdAt }  
// Subscription: { id, fanId, creatorId, startDate, endDate }  
  
// API: Create a new post  
router.post('/posts', (req, res) => {  
  const { creatorId, type, contentUrl, caption } = req.body;  
  if (!creatorId || !type || !contentUrl) {  
    return res.status(400).send('Missing required fields');  
  }  
  const post = { id: posts.length + 1, creatorId, type, contentUrl, caption, createdAt: new Date() };  
  posts.push(post);  
  res.status(201).json(post);  
});  
  
// API: Get posts by creator  
router.get('/posts/:creatorId', (req, res) => {  
  const creatorId = parseInt(req.params.creatorId);  
  const creatorPosts = posts.filter(p => p.creatorId === creatorId);  
  res.json(creatorPosts);  
});  
  
// API: Subscribe to a creator  
router.post('/subscribe', (req, res) => {  
  const { fanId, creatorId, durationMonths } = req.body;  
  if (!fanId || !creatorId || !durationMonths) {  
    return res.status(400).send('Missing required fields');  
  }  
  const startDate = new Date();  
  const endDate = new Date();  
  endDate.setMonth(endDate.getMonth() + durationMonths);  
  const subscription = { id: subscriptions.length + 1, fanId, creatorId, startDate, endDate };  
  subscriptions.push(subscription);  
  res.status(201).json(subscription);  
});  
  
// API: Check subscription status  
router.get('/subscription-status', (req, res) => {  
  const { fanId, creatorId } = req.query;  
  if (!fanId || !creatorId) {  
    return res.status(400).send('Missing fanId or creatorId');  
  }  
  const now = new Date();  
  const active = subscriptions.some(sub => sub.fanId === parseInt(fanId) && sub.creatorId === parseInt(creatorId) && sub.endDate > now);  
  res.json({ active });  
});  
  
module.exports = router;  
  
// Frontend React snippet for Creator Content Posting  
/*  
import React, { useState } from 'react';  
  
function CreatorPostForm({ creatorId }) {  
  const [type, setType] = useState('photo');  
  const [contentUrl, setContentUrl] = useState('');  
  const [caption, setCaption] = useState('');  
  const [status, setStatus] = useState('');  
  
  const handleSubmit = async (e) => {  
    e.preventDefault();  
    const response = await fetch('/api/subscription-content/posts', {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify({ creatorId, type, contentUrl, caption })  
    });  
    if (response.ok) {  
      setStatus('Post created successfully');  
      setContentUrl('');  
      setCaption('');  
    } else {  
      setStatus('Failed to create post');  
    }  
  };  
  
  return (  
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: 'auto' }}>  
      <h2>Create New Post</h2>  
      <label>Type</label>  
      <select value={type} onChange={e => setType(e.target.value)}>  
        <option value="photo">Photo</option>  
        <option value="video">Video</option>  
        <option value="text">Text</option>  
      </select>  
      <label>Content URL</label>  
      <input type="text" value={contentUrl} onChange={e => setContentUrl(e.target.value)} required />  
      <label>Caption</label>  
      <textarea value={caption} onChange={e => setCaption(e.target.value)} />  
      <button type="submit">Post</button>  
      {status && <p>{status}</p>}  
    </form>  
  );  
}  
  
export default CreatorPostForm;  
*/  
  
// Frontend React snippet for Fan Subscription  
/*  
import React, { useState } from 'react';  
  
function SubscribeForm({ fanId, creatorId }) {  
  const [duration, setDuration] = useState(1); // months  
  const [status, setStatus] = useState('');  
  
  const handleSubscribe = async (e) => {  
    e.preventDefault();  
    const response = await fetch('/api/subscription-content/subscribe', {  
      method: 'POST',  
      headers: { 'Content-Type': 'application/json' },  
      body: JSON.stringify({ fanId, creatorId, durationMonths: duration })  
    });  
    if (response.ok) {  
      setStatus('Subscription successful');  
    } else {  
      setStatus('Subscription failed');  
    }  
  };  
  
  return (  
    <form onSubmit={handleSubscribe} style={{ maxWidth: 300, margin: 'auto' }}>  
      <h3>Subscribe to Creator</h3>  
      <label>Duration (months)</label>  
      <input type="number" min="1" max="12" value={duration} onChange={e => setDuration(parseInt(e.target.value))} />  
      <button type="submit">Subscribe</button>  
      {status && <p>{status}</p>}  
    </form>  
  );  
}  
  
export default SubscribeForm;  
*/  

// moderationRoutes.js
const express = require('express');
const router = express.Router();
const mod = require('./moderationService');

function requireAuth(req,res,next){ if(!req.user) return res.status(401).json({error:'Unauthorized'}); next(); }
function requireMod(req,res,next){ if(!req.user) return res.status(401).json({error:'Unauthorized'}); if(!['moderator','headmistress','admin'].includes(req.user.role)) return res.status(403).json({error:'Forbidden'}); next(); }

// Submit a report
router.post('/reports', requireAuth, async (req,res,next)=>{
  try{
    const { reportedUserId, contentId, reason, details, severity } = req.body;
    const r = await mod.submitReport({ reporterId: req.user.id, reportedUserId, contentId, reason, details, severity });
    res.status(201).json({ data: r });
  }catch(err){ next(err); }
});

// Attach evidence (expects s3Key)
router.post('/reports/:id/attach', requireAuth, async (req,res,next)=>{
  try{
    const { id } = req.params;
    const { s3Key } = req.body;
    const a = await mod.attachEvidence(id, s3Key);
    res.json({ data: a });
  }catch(err){ next(err); }
});

// Get pending reports (moderator queue)
router.get('/reports/pending', requireMod, async (req,res,next)=>{
  try{
    const rows = await mod.getPendingReports(100);
    res.json({ data: rows });
  }catch(err){ next(err); }
});

// Take moderation action
router.post('/actions', requireMod, async (req,res,next)=>{
  try{
    const { reportId, actionType, notes } = req.body;
    const action = await mod.takeModerationAction({ reportId, moderatorId: req.user.id, actionType, notes });
    res.status(201).json({ data: action });
  }catch(err){ next(err); }
});

// Submit an appeal
router.post('/appeals', requireAuth, async (req,res,next)=>{
  try{
    const { actionId, reason } = req.body;
    const appeal = await mod.submitAppeal({ actionId, userId: req.user.id, reason });
    res.status(201).json({ data: appeal });
  }catch(err){ next(err); }
});

module.exports = router;

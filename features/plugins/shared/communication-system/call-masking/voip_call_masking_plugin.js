// VoIP Call Masking Plugin for Mistress-X Platform using Twilio

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const { createCallNumberStore } = require('./call_number_store');

// Twilio credentials must come from environment variables in production.
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioProxyNumber = process.env.TWILIO_PROXY_NUMBER;
const baseUrl = (process.env.BASE_URL || '').replace(/\/$/, '');

if (!accountSid || !authToken || !twilioProxyNumber || !baseUrl) {
  console.warn('[voip-call-masking] Missing Twilio environment values. Check Twilio setup docs and .env.example.');
}

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Storage adapter. Local preview uses process memory. Production must inject/provide
// a database adapter with encrypted storage through createCallNumberStore({ db, crypto }).
const callNumberStore = createCallNumberStore();

// API: Mistress sets her real phone number (stored encrypted in production).
router.post('/mistress/set-number', async (req, res) => {
  const { mistressId, phoneNumber } = req.body;
  if (!mistressId || !phoneNumber) {
    return res.status(400).send('Missing mistressId or phoneNumber');
  }

  await callNumberStore.setMistressNumber({ mistressId, phoneNumber });
  res.status(200).json({ message: 'Phone number saved', storage: callNumberStore.getMode() });
});

// API: Initiate masked call from user to Mistress.
router.post('/call/initiate', async (req, res) => {
  const { userNumber, mistressId } = req.body;
  if (!userNumber || !mistressId) {
    return res.status(400).send('Missing userNumber or mistressId');
  }

  if (!twilioClient || !twilioProxyNumber || !baseUrl) {
    return res.status(503).send('Twilio call masking is not configured');
  }

  const mistressNumber = await callNumberStore.getMistressNumber(mistressId);
  if (!mistressNumber) {
    return res.status(404).send('Mistress number not found');
  }

  try {
    const connectPath = '/api/voip-call-masking/call/connect';

    await twilioClient.calls.create({
      url: `${baseUrl}${connectPath}?to=${encodeURIComponent(userNumber)}&from=${encodeURIComponent(twilioProxyNumber)}`,
      to: userNumber,
      from: twilioProxyNumber,
    });

    await twilioClient.calls.create({
      url: `${baseUrl}${connectPath}?to=${encodeURIComponent(mistressNumber)}&from=${encodeURIComponent(twilioProxyNumber)}`,
      to: mistressNumber,
      from: twilioProxyNumber,
    });

    res.status(200).json({ message: 'Call initiated via proxy number' });
  } catch (error) {
    console.error('Twilio call error:', error);
    res.status(500).send('Failed to initiate call');
  }
});

// API: Twilio webhook to connect calls (TwiML response).
router.post('/call/connect', (req, res) => {
  const to = req.query.to;
  const from = req.query.from;
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.dial({ callerId: from }, to);
  res.type('text/xml');
  res.send(twiml.toString());
});

module.exports = router;

// Frontend React snippet for Call Button
/*
import React, { useState } from 'react';

function CallMistressButton({ mistressId, userNumber }) {
  const [status, setStatus] = useState('');

  const initiateCall = async () => {
    setStatus('Calling...');
    const response = await fetch('/api/voip-call-masking/call/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistressId, userNumber })
    });
    if (response.ok) {
      setStatus('Call initiated. Please answer your phone.');
    } else {
      setStatus('Failed to initiate call');
    }
  };

  return (
    <button onClick={initiateCall} style={{ padding: '10px 20px', fontSize: '16px' }}>
      Call Mistress
    </button>
  );
}

export default CallMistressButton;
*/

// Notes:
// - Set BASE_URL to your deployed public HTTPS app URL.
// - Use environment variables for Twilio credentials and proxy number.
// - Secure all endpoints and validate user permissions.
// - Twilio webhook URL must be publicly accessible and configured in Twilio Console.
// - Production must provide encrypted database-backed call number storage.

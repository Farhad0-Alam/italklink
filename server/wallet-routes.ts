import { Router } from 'express';
import { requireAuth, optionalAuth } from './auth';
import { storage } from './storage';
import * as QRCode from 'qrcode';
import type { BusinessCard } from '@shared/schema';

const router = Router();

// Get wallet pass status for an ecard
router.get('/status/:ecardId', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get wallet pass data
    const walletPass = await storage.getWalletPass(ecardId);
    
    res.json({
      hasApple: !!walletPass?.applePassSerial,
      hasGoogle: !!walletPass?.googleObjectId,
      lastGeneratedAt: walletPass?.lastGeneratedAt || null
    });
  } catch (error) {
    console.error('Error fetching wallet status:', error);
    res.status(500).json({ message: 'Failed to fetch wallet status' });
  }
});

// Create Apple Wallet pass (.pkpass file)
router.post('/apple/:ecardId/create', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // For now, return a placeholder response until PassKit is set up
    // This will be updated once the PassKit certificate configuration is complete
    res.status(501).json({ 
      message: 'Apple Wallet pass generation requires PassKit certificates to be configured',
      supportedFeatures: ['QR Code generation', 'Card data extraction'],
      nextSteps: 'Configure APPLE_TEAM_ID, APPLE_PASS_TYPE_ID, and certificates'
    });
    
  } catch (error) {
    console.error('Error creating Apple pass:', error);
    res.status(500).json({ message: 'Failed to create Apple pass' });
  }
});

// Create Google Wallet pass (JWT URL)
router.post('/google/:ecardId/create', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data  
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // For now, return a placeholder response until Google Wallet API is set up
    // This will be updated once the Google Wallet service account is configured
    res.status(501).json({
      message: 'Google Wallet pass generation requires service account configuration', 
      supportedFeatures: ['QR Code generation', 'Card data extraction'],
      nextSteps: 'Configure GOOGLE_WALLET_ISSUER_ID and service account credentials'
    });
    
  } catch (error) {
    console.error('Error creating Google pass:', error);
    res.status(500).json({ message: 'Failed to create Google pass' });
  }
});

// Generate QR code for ecard (helper endpoint)
router.get('/qr/:ecardId', async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // Generate public URL for the card
    const publicUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5000'}/${card.shareSlug || card.customUrl || card.id}`;
    
    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(publicUrl, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: card.brandColor || '#000000',
        light: '#FFFFFF'
      }
    });
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.send(qrBuffer);
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

export default router;
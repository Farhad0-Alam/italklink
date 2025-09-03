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

// Create Apple Wallet pass (vCard format for iOS)
router.post('/apple/:ecardId/create', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // Generate vCard content for iOS
    const vCardContent = generateVCard(card);
    
    // Generate filename
    const fileName = `${card.fullName.replace(/\s+/g, '_')}_Contact.vcf`;
    
    // Set headers for vCard download
    res.set({
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': Buffer.byteLength(vCardContent, 'utf8')
    });
    
    // Send vCard content
    res.send(vCardContent);
    
  } catch (error) {
    console.error('Error creating Apple pass:', error);
    res.status(500).json({ message: 'Failed to create Apple pass' });
  }
});

// Create Google Wallet pass (vCard format for Android)
router.post('/google/:ecardId/create', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data  
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // Generate vCard content for Android
    const vCardContent = generateVCard(card);
    
    // Generate filename
    const fileName = `${card.fullName.replace(/\s+/g, '_')}_Contact.vcf`;
    
    // Set headers for vCard download
    res.set({
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': Buffer.byteLength(vCardContent, 'utf8')
    });
    
    // Send vCard content
    res.send(vCardContent);
    
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

// Helper function to generate vCard content
function generateVCard(card: BusinessCard): string {
  const publicUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5000'}/${card.shareSlug || card.customUrl || card.id}`;
  
  // Build vCard 3.0 format (most compatible)
  let vCard = 'BEGIN:VCARD\r\n';
  vCard += 'VERSION:3.0\r\n';
  
  // Full name (required)
  vCard += `FN:${escapeVCardText(card.fullName)}\r\n`;
  
  // Name components
  const nameParts = card.fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  vCard += `N:${escapeVCardText(lastName)};${escapeVCardText(firstName)};;;\r\n`;
  
  // Title/Position
  if (card.title) {
    vCard += `TITLE:${escapeVCardText(card.title)}\r\n`;
  }
  
  // Organization
  if (card.company) {
    vCard += `ORG:${escapeVCardText(card.company)}\r\n`;
  }
  
  // Phone number
  if (card.phone) {
    vCard += `TEL;TYPE=WORK,VOICE:${escapeVCardText(card.phone)}\r\n`;
  }
  
  // WhatsApp
  if (card.whatsapp) {
    vCard += `TEL;TYPE=WORK,TEXT:${escapeVCardText(card.whatsapp)}\r\n`;
  }
  
  // Email
  if (card.email) {
    vCard += `EMAIL;TYPE=WORK:${escapeVCardText(card.email)}\r\n`;
  }
  
  // Website
  if (card.website) {
    let website = card.website;
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      website = 'https://' + website;
    }
    vCard += `URL;TYPE=WORK:${escapeVCardText(website)}\r\n`;
  }
  
  // Business card URL
  vCard += `URL;TYPE=BUSINESS-CARD:${escapeVCardText(publicUrl)}\r\n`;
  
  // Address
  if (card.location) {
    vCard += `ADR;TYPE=WORK:;;${escapeVCardText(card.location)};;;;\r\n`;
  }
  
  // Note with about information
  if (card.about) {
    vCard += `NOTE:${escapeVCardText(card.about)}\r\n`;
  }
  
  // Social media links
  if (card.linkedin) {
    const linkedinUrl = card.linkedin.startsWith('http') ? card.linkedin : `https://linkedin.com/in/${card.linkedin}`;
    vCard += `URL;TYPE=LINKEDIN:${escapeVCardText(linkedinUrl)}\r\n`;
  }
  
  if (card.twitter) {
    const twitterUrl = card.twitter.startsWith('http') ? card.twitter : `https://twitter.com/${card.twitter}`;
    vCard += `URL;TYPE=TWITTER:${escapeVCardText(twitterUrl)}\r\n`;
  }
  
  if (card.instagram) {
    const instagramUrl = card.instagram.startsWith('http') ? card.instagram : `https://instagram.com/${card.instagram}`;
    vCard += `URL;TYPE=INSTAGRAM:${escapeVCardText(instagramUrl)}\r\n`;
  }
  
  if (card.facebook) {
    const facebookUrl = card.facebook.startsWith('http') ? card.facebook : `https://facebook.com/${card.facebook}`;
    vCard += `URL;TYPE=FACEBOOK:${escapeVCardText(facebookUrl)}\r\n`;
  }
  
  if (card.youtube) {
    const youtubeUrl = card.youtube.startsWith('http') ? card.youtube : `https://youtube.com/@${card.youtube}`;
    vCard += `URL;TYPE=YOUTUBE:${escapeVCardText(youtubeUrl)}\r\n`;
  }
  
  if (card.telegram) {
    const telegramUrl = card.telegram.startsWith('http') ? card.telegram : `https://t.me/${card.telegram}`;
    vCard += `URL;TYPE=TELEGRAM:${escapeVCardText(telegramUrl)}\r\n`;
  }
  
  // Custom social links
  if (card.customSocials && card.customSocials.length > 0) {
    card.customSocials.forEach((social, index) => {
      if (social.url) {
        let url = social.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        vCard += `URL;TYPE=CUSTOM-${index + 1}:${escapeVCardText(url)}\r\n`;
      }
    });
  }
  
  // Custom contact methods
  if (card.customContacts && card.customContacts.length > 0) {
    card.customContacts.forEach((contact, index) => {
      if (contact.value) {
        vCard += `X-CUSTOM-${index + 1}:${escapeVCardText(contact.value)}\r\n`;
      }
    });
  }
  
  // End vCard
  vCard += 'END:VCARD\r\n';
  
  return vCard;
}

// Helper function to escape special characters in vCard text
function escapeVCardText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

export default router;
import { Router } from 'express';
import { requireAuth, optionalAuth } from './auth';
import { storage } from './storage';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
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

    // Generate Apple Wallet pass JSON
    const passData = generateAppleWalletPass(card);
    
    // For production, this would create a proper .pkpass file with certificates
    // For now, return the pass data for Apple Wallet integration
    res.json({
      success: true,
      passType: 'apple_wallet',
      passData: passData,
      message: 'Apple Wallet pass generated successfully',
      // In production, this would be a download URL for the .pkpass file
      downloadUrl: `/api/wallet/apple/${ecardId}/download`
    });
    
  } catch (error) {
    console.error('Error creating Apple pass:', error);
    res.status(500).json({ message: 'Failed to create Apple pass' });
  }
});

// Create Google Wallet pass (JWT token)
router.post('/google/:ecardId/create', optionalAuth, async (req, res) => {
  try {
    const { ecardId } = req.params;
    
    // Get business card data  
    const card = await storage.getBusinessCard(ecardId);
    if (!card || !card.isPublic) {
      return res.status(404).json({ message: 'Business card not found or not public' });
    }

    // Check if this is production with real Google Wallet credentials
    const hasRealCredentials = process.env.GOOGLE_WALLET_ISSUER_ID && 
                              process.env.GOOGLE_WALLET_PRIVATE_KEY && 
                              process.env.GOOGLE_WALLET_PRIVATE_KEY !== 'demo-secret-key' &&
                              process.env.GOOGLE_WALLET_ISSUER_ID !== 'your-issuer-id';

    // Force demo mode for now since we don't have real credentials
    if (true) {
      // Demo mode - provide explanation instead of broken link
      res.json({
        success: true,
        passType: 'google_wallet_demo',
        message: 'Google Wallet Demo Mode',
        demoInfo: {
          status: 'Demo mode - Google Wallet requires production setup',
          requirements: [
            'Google Cloud Project with Wallet API enabled',
            'Service account with Google Wallet permissions', 
            'Pass class configured in Google Wallet Console',
            'Environment variables: GOOGLE_WALLET_ISSUER_ID, GOOGLE_WALLET_PRIVATE_KEY'
          ],
          businessCardData: {
            name: card.fullName,
            title: card.title || 'Professional',
            company: card.company || 'Independent',
            contact: card.phone || card.email || 'Contact available on business card',
            cardUrl: `${process.env.PUBLIC_APP_URL || 'http://localhost:5000'}/${card.shareSlug || card.customUrl || card.id}`
          }
        }
      });
      return;
    }

    // Production mode - generate real JWT token
    const jwtToken = generateGoogleWalletJWT(card);
    const googleWalletUrl = `https://pay.google.com/gp/v/save/${jwtToken}`;
    
    res.json({
      success: true,
      passType: 'google_wallet',
      jwtToken: jwtToken,
      saveUrl: googleWalletUrl,
      message: 'Google Wallet pass generated successfully'
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

// Generate Apple Wallet Pass Data (PassKit format)
function generateAppleWalletPass(card: any): any {
  const publicUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5000'}/${card.shareSlug || card.customUrl || card.id}`;
  
  return {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.2talklink.businesscard',
    serialNumber: card.id,
    teamIdentifier: 'YOUR_TEAM_ID',
    organizationName: '2TalkLink',
    description: `Business Card - ${card.fullName}`,
    logoText: '2TalkLink',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(30, 41, 59)',
    labelColor: 'rgb(148, 163, 184)',
    generic: {
      primaryFields: [
        {
          key: 'name',
          label: 'Name',
          value: card.fullName
        }
      ],
      secondaryFields: [
        {
          key: 'title',
          label: 'Title',
          value: card.title || 'Professional'
        },
        {
          key: 'company',
          label: 'Company',
          value: card.company || 'Independent'
        }
      ],
      auxiliaryFields: [
        {
          key: 'phone',
          label: 'Phone',
          value: card.phone || 'N/A'
        },
        {
          key: 'email',
          label: 'Email',
          value: card.email || 'N/A'
        }
      ],
      backFields: [
        {
          key: 'website',
          label: 'Website',
          value: card.website || publicUrl
        },
        {
          key: 'location',
          label: 'Location',
          value: card.location || 'N/A'
        },
        {
          key: 'about',
          label: 'About',
          value: card.about || 'Professional business card'
        }
      ]
    },
    barcode: {
      message: publicUrl,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    },
    relevantDate: new Date().toISOString()
  };
}

// Generate Google Wallet JWT Token (simplified)
function generateGoogleWalletJWT(card: any): string {
  const publicUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5000'}/${card.shareSlug || card.customUrl || card.id}`;
  
  const payload = {
    iss: 'your-service-account-email@your-project.iam.gserviceaccount.com',
    aud: 'google',
    typ: 'savetowallet',
    origins: [process.env.PUBLIC_APP_URL || 'http://localhost:5000'],
    payload: {
      loyaltyObjects: [
        {
          id: `business-card-${card.id}`,
          classId: 'business-card-class-id',
          state: 'active',
          heroImage: {
            sourceUri: {
              uri: 'https://via.placeholder.com/1032x336/1e293b/ffffff?text=2TalkLink'
            }
          },
          textModulesData: [
            {
              header: 'Name',
              body: card.fullName,
              id: 'name'
            },
            {
              header: 'Title',
              body: card.title || 'Professional',
              id: 'title'
            },
            {
              header: 'Company',
              body: card.company || 'Independent',
              id: 'company'
            },
            {
              header: 'Contact',
              body: card.phone || card.email || 'See business card',
              id: 'contact'
            }
          ],
          linksModuleData: {
            uris: [
              {
                uri: publicUrl,
                description: 'View Business Card',
                id: 'business-card-link'
              }
            ]
          },
          barcode: {
            type: 'qrCode',
            value: publicUrl
          },
          cardTitle: {
            defaultValue: {
              language: 'en-US',
              value: 'Business Card'
            }
          },
          subheader: {
            defaultValue: {
              language: 'en-US', 
              value: card.fullName
            }
          },
          header: {
            defaultValue: {
              language: 'en-US',
              value: card.title || 'Professional'
            }
          }
        }
      ]
    }
  };
  
  // Create a simple base64 encoded JWT-like token for demo
  const header = { typ: 'JWT', alg: 'HS256' };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Simple signature using HMAC
  const secret = process.env.GOOGLE_WALLET_PRIVATE_KEY || 'demo-secret-key';
  const signature = crypto.createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
    
  return `${headerB64}.${payloadB64}.${signature}`;
}

export default router;
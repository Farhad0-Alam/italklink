import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { requireAuth, requireAdmin } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { z } from 'zod';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'server/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${nanoid()}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const upload = multer({ storage: storage_multer });

// ===== SELLER ROUTES =====

// Upload product file
router.post('/upload', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    filePath: fileUrl,
    fileSize: req.file.size,
    fileName: req.file.originalname,
  });
}));

// Create product
router.post('/products', requireAuth, asyncHandler(async (req, res) => {
  const { title, slug, description, shortDescription, price, discountPrice, category, filePath, fileSize, fileType } = req.body;

  if (!title || !slug || !price || !filePath) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = await storage.createDigitalProduct({
    sellerId: req.user.id,
    title,
    slug,
    description,
    shortDescription,
    price: Math.round(parseFloat(price) * 100),
    discountPrice: discountPrice ? Math.round(parseFloat(discountPrice) * 100) : undefined,
    category,
    filePath,
    fileSize,
    fileType,
    status: 'draft',
    commissionPercentage: 20,
  });

  res.json({ success: true, data: product });
}));

// Get seller's products
router.get('/products', requireAuth, asyncHandler(async (req, res) => {
  const products = await storage.getSellerProducts(req.user.id);
  res.json({ success: true, data: products });
}));

// Update product
router.patch('/products/:id', requireAuth, asyncHandler(async (req, res) => {
  const product = await storage.updateDigitalProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
}));

// Delete product
router.delete('/products/:id', requireAuth, asyncHandler(async (req, res) => {
  await storage.deleteDigitalProduct(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
}));

// Get seller orders
router.get('/seller/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await storage.getSellerOrders(req.user.id);
  res.json({ success: true, data: orders });
}));

// Get seller analytics
router.get('/seller/analytics', requireAuth, asyncHandler(async (req, res) => {
  const analytics = await storage.getSellerAnalytics(req.user.id);
  res.json({ success: true, data: analytics });
}));

// ===== BUYER ROUTES =====

// Browse shop products
router.get('/browse', asyncHandler(async (req, res) => {
  const { category, search, limit = 12, offset = 0 } = req.query;
  
  const products = await storage.browseProducts({
    category: category as string,
    search: search as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });

  res.json({ success: true, data: products });
}));

// Get product details
router.get('/:slug', asyncHandler(async (req, res) => {
  const product = await storage.getProductBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, data: product });
}));

// Get buyer orders
router.get('/buyer/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await storage.getBuyerOrders(req.user.id);
  res.json({ success: true, data: orders });
}));

// ===== PAYMENT & CHECKOUT =====

// Create checkout session
router.post('/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await storage.getDigitalProduct(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const customer = await stripe.customers.create({
    email: req.user.email,
    metadata: { userId: req.user.id },
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.shortDescription,
          },
          unit_amount: product.discountPrice || product.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/shop/product/${product.slug}`,
    metadata: {
      productId,
      buyerId: req.user.id,
      buyerEmail: req.user.email,
    },
  });

  res.json({ success: true, url: session.url, sessionId: session.id });
}));

// ===== ADMIN ROUTES =====

// Get all products (admin moderation)
router.get('/admin/products-all', requireAdmin, asyncHandler(async (req, res) => {
  const products = await storage.getAllProducts();
  res.json({ success: true, data: products });
}));

// Approve/Reject product
router.patch('/admin/products/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const product = await storage.updateProductStatus(req.params.id, status);
  res.json({ success: true, data: product });
}));

// Get shop analytics (admin)
router.get('/admin/analytics', requireAdmin, asyncHandler(async (req, res) => {
  const analytics = await storage.getShopAnalytics();
  res.json({ success: true, data: analytics });
}));

// Get all orders (admin)
router.get('/admin/all-orders', requireAdmin, asyncHandler(async (req, res) => {
  const orders = await storage.getAllOrders();
  res.json({ success: true, data: orders });
}));

// ===== SECURE DOWNLOAD =====

router.get('/download/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const download = await storage.getDownloadByToken(token);
  if (!download || download.status === 'expired' || download.status === 'revoked') {
    return res.status(401).json({ error: 'Invalid or expired download link' });
  }

  if (download.downloadCount >= download.maxDownloads) {
    return res.status(403).json({ error: 'Download limit exceeded' });
  }

  const filePath = path.join(process.cwd(), 'server', download.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Increment download count
  await storage.incrementDownloadCount(download.id);

  res.download(filePath);
}));

export default router;

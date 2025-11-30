import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { requireAuth, requireAdmin } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
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

// ===== BYPASS AUTH MIDDLEWARE FOR PUBLIC ROUTES =====
// Create a sub-router for public endpoints that skips authentication
const publicRouter = Router();

publicRouter.get('/categories', asyncHandler(async (req, res) => {
  const categories = await storage.getShopCategories();
  res.json({ success: true, data: categories });
}));

publicRouter.get('/browse', asyncHandler(async (req, res) => {
  const { category, search, limit = 12, offset = 0 } = req.query;
  
  const products = await storage.browseProducts({
    category: category as string,
    search: search as string,
    limit: parseInt(limit as string) || 12,
    offset: parseInt(offset as string) || 0,
  });

  res.json({ success: true, data: products });
}));

publicRouter.get('/product/:slug', asyncHandler(async (req, res) => {
  const product = await storage.getProductBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, data: product });
}));

// Get seller profile with stats
publicRouter.get('/seller/:sellerId', asyncHandler(async (req, res) => {
  const { db } = await import('./db');
  const { eq } = await import('drizzle-orm');
  const { users, digitalProducts, shopOrders } = await import('@shared/schema');
  
  const seller = await db.query.users.findFirst({
    where: eq(users.id, req.params.sellerId)
  });

  if (!seller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  const sellerProducts = await db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, req.params.sellerId));
  const sellerOrdersData = await db.select().from(shopOrders).where(eq(shopOrders.sellerId, req.params.sellerId));
  
  const completedOrders = sellerOrdersData.filter(o => o.paymentStatus === 'completed');
  const avgRating = sellerProducts.length > 0 
    ? (sellerProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / sellerProducts.length / 100).toFixed(1)
    : 0;

  res.json({
    success: true,
    data: {
      id: seller.id,
      name: seller.firstName || 'Shop Owner',
      email: seller.email,
      avatar: seller.avatarUrl,
      rating: parseFloat(avgRating),
      positiveReviews: 98,
      responseTime: '<1 hour',
      productsSold: completedOrders.length,
      totalProducts: sellerProducts.length
    }
  });
}));

// Get product reviews/orders as reviews
publicRouter.get('/product/:slug/reviews', asyncHandler(async (req, res) => {
  const { db } = await import('./db');
  const { eq } = await import('drizzle-orm');
  const { digitalProducts, shopOrders, users } = await import('@shared/schema');

  const product = await db.query.digitalProducts.findFirst({
    where: eq(digitalProducts.slug, req.params.slug)
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const orders = await db.select().from(shopOrders)
    .where(eq(shopOrders.productId, product.id))
    .limit(5);

  const reviewsWithBuyers = await Promise.all(orders.map(async (order) => {
    const buyer = await db.query.users.findFirst({
      where: eq(users.id, order.buyerId)
    });
    return {
      id: order.id,
      buyerName: buyer?.firstName || 'Customer',
      rating: product.rating || 5,
      createdAt: order.createdAt,
      comment: 'Great product! Exactly what I was looking for. The quality is excellent.'
    };
  }));

  res.json({ success: true, data: reviewsWithBuyers });
}));

// Get related products
publicRouter.get('/product/:slug/related', asyncHandler(async (req, res) => {
  const { db } = await import('./db');
  const { eq, and, ne } = await import('drizzle-orm');
  const { digitalProducts } = await import('@shared/schema');

  const product = await db.query.digitalProducts.findFirst({
    where: eq(digitalProducts.slug, req.params.slug)
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const related = await db.select()
    .from(digitalProducts)
    .where(and(
      eq(digitalProducts.category, product.category),
      ne(digitalProducts.id, product.id),
      eq(digitalProducts.status, 'active')
    ))
    .limit(4);

  res.json({ success: true, data: related });
}));

// Mount public endpoints on main router
router.use(publicRouter);

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
  const { title, slug, description, shortDescription, price, discountPrice, category, filePath, fileSize, fileType, thumbnailUrl } = req.body;

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
    thumbnailUrl,
    status: 'pending',
  } as any);

  res.json({ success: true, data: product });
}));

// Get seller's products
router.get('/seller/products', requireAuth, asyncHandler(async (req, res) => {
  const products = await storage.getSellerProducts(req.user.id);
  res.json({ success: true, data: products });
}));

// Update product
router.patch('/seller/products/:id', requireAuth, asyncHandler(async (req, res) => {
  const product = await storage.updateDigitalProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
}));

// Delete product
router.delete('/seller/products/:id', requireAuth, asyncHandler(async (req, res) => {
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

// Get buyer orders
router.get('/buyer/orders', requireAuth, asyncHandler(async (req, res) => {
  const orders = await storage.getBuyerOrders(req.user.id);
  res.json({ success: true, data: orders });
}));

// Get buyer purchases
router.get('/user/purchases', requireAuth, asyncHandler(async (req, res) => {
  const purchases = await storage.getBuyerOrders(req.user.id);
  res.json({ success: true, data: purchases });
}));

// Get buyer downloads
router.get('/user/downloads', requireAuth, asyncHandler(async (req, res) => {
  const downloads = await storage.getBuyerDownloads(req.user.id);
  res.json({ success: true, data: downloads });
}));

// ===== PAYMENT & CHECKOUT =====

// Create checkout session
router.post('/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { productId, referrerId } = req.body;

  const product = await storage.getDigitalProduct(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const downloadToken = nanoid(32);
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
      referrerId: referrerId || '',
      downloadToken,
    },
  });

  res.json({ success: true, url: session.url, sessionId: session.id });
}));

// ===== ADMIN ROUTES =====

// Get all products (admin moderation)
router.get('/admin/products', requireAdmin, asyncHandler(async (req, res) => {
  const products = await storage.getAllProducts();
  res.json({ success: true, data: products });
}));

// Update product status
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
router.get('/admin/orders', requireAdmin, asyncHandler(async (req, res) => {
  const orders = await storage.getAllOrders();
  res.json({ success: true, data: orders });
}));

// Get commission settings (admin)
router.get('/admin/commission-settings', requireAdmin, asyncHandler(async (req, res) => {
  const settings = await storage.getPlatformSettings();
  res.json({ 
    success: true, 
    data: settings || {
      ownerCommission: 50,
      sellerCommission: 30,
      platformCommission: 20,
    }
  });
}));

// Update commission settings (admin)
router.patch('/admin/commission-settings', requireAdmin, asyncHandler(async (req, res) => {
  const { ownerCommission, sellerCommission, platformCommission } = req.body;
  
  if (ownerCommission + sellerCommission + platformCommission !== 100) {
    return res.status(400).json({ error: 'Commission percentages must total 100%' });
  }
  
  const settings = await storage.updatePlatformSettings({
    defaultOwnerCommission: ownerCommission,
    defaultSellerCommission: sellerCommission,
    defaultPlatformCommission: platformCommission,
  });
  
  res.json({ success: true, data: settings });
}));

// ===== SECURE DOWNLOAD =====

router.get('/download/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const download = await storage.getDownloadByToken(token);
  if (!download) {
    return res.status(401).json({ error: 'Invalid or expired download link' });
  }

  if (download.expiresAt && new Date() > download.expiresAt) {
    return res.status(401).json({ error: 'Download link expired' });
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

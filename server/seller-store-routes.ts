import { Router } from 'express';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get seller info by ID
router.get('/:sellerId', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  
  const seller = await storage.getUser(sellerId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  res.json({
    success: true,
    data: {
      id: seller.id,
      email: seller.email,
      fullName: seller.fullName,
      profileImage: seller.profileImage,
      bio: seller.bio,
      company: seller.company,
      website: seller.website,
      location: seller.location,
    },
  });
}));

// Get seller's products with sorting
router.get('/:sellerId/products', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { sort = 'newest' } = req.query;

  // Get all products from this seller
  const allProducts = await storage.getAllProductsBySeller(sellerId);

  // Sort based on query parameter
  let sortedProducts = [...allProducts];
  
  switch (sort) {
    case 'popular':
      sortedProducts.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    case 'rating':
      sortedProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      break;
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
    default:
      // Already sorted by created date in storage method
      break;
  }

  res.json({
    success: true,
    data: sortedProducts.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      image: p.image,
      views: p.views || 0,
      purchases: p.purchases || 0,
      averageRating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
    })),
  });
}));

// Get seller's public stats
router.get('/:sellerId/stats', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const stats = await storage.getSellerStats(sellerId);
  
  res.json({
    success: true,
    data: stats,
  });
}));

export default router;

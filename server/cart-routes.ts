import { Router } from 'express';
import { requireAuth } from './auth';
import asyncHandler from 'express-async-handler';
import { storage } from './storage';

const router = Router();

// Get user's cart
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const cart = await storage.getCart(req.user.id);
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  res.json({
    success: true,
    data: {
      items: cart.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        subtotal: item.product.price * item.quantity,
      })),
      total,
      itemCount: cart.length,
    }
  });
}));

// Get cart count
router.get('/count', requireAuth, asyncHandler(async (req, res) => {
  const count = await storage.getCartCount(req.user.id);
  res.json({ success: true, data: { count } });
}));

// Add to cart
router.post('/add', requireAuth, asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  const product = await storage.getDigitalProduct(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const item = await storage.addToCart(req.user.id, productId, quantity);
  const count = await storage.getCartCount(req.user.id);
  
  res.json({
    success: true,
    data: { item, cartCount: count },
    message: 'Product added to cart'
  });
}));

// Update cart item
router.patch('/update/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const item = await storage.updateCartItem(req.user.id, productId, quantity);
  res.json({ success: true, data: { item }, message: 'Cart updated' });
}));

// Remove from cart
router.delete('/remove/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await storage.removeFromCart(req.user.id, productId);
  const count = await storage.getCartCount(req.user.id);
  
  res.json({
    success: true,
    data: { cartCount: count },
    message: 'Item removed from cart'
  });
}));

// Clear cart
router.delete('/clear', requireAuth, asyncHandler(async (req, res) => {
  await storage.clearCart(req.user.id);
  res.json({ success: true, message: 'Cart cleared' });
}));

export default router;

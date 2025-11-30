import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { shopEmailService } from './shop-email-service';

const router = Router();

// Trigger purchase confirmation email (admin/system use)
router.post('/purchase-confirmation/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  await shopEmailService.sendPurchaseConfirmation(orderId);
  
  res.json({ success: true });
}));

// Trigger download link email (admin/system use)
router.post('/download-link/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { downloadToken } = req.body;
  
  if (!downloadToken) {
    return res.status(400).json({ error: 'Download token required' });
  }
  
  await shopEmailService.sendDownloadLink(orderId, downloadToken);
  
  res.json({ success: true });
}));

// Trigger order status update email (admin/system use)
router.post('/order-update/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }
  
  await shopEmailService.sendOrderUpdate(orderId, status);
  
  res.json({ success: true });
}));

// Trigger seller notification email (admin/system use)
router.post('/seller-notification/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  await shopEmailService.sendSellerNotification(orderId);
  
  res.json({ success: true });
}));

// Trigger low stock alert email (admin/system use)
router.post('/low-stock-alert/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await shopEmailService.sendLowStockAlert(productId);
  
  res.json({ success: true });
}));

export default router;

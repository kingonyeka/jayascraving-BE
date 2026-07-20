"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStatusUpdateTemplate = orderStatusUpdateTemplate;
const STATUS_LABELS = {
    CONFIRMED: { label: 'Order Confirmed', emoji: '✅', message: 'Your order has been confirmed and is being prepared.' },
    PROCESSING: { label: 'Processing', emoji: '👩‍🍳', message: 'Your order is now being processed by our team.' },
    BAKING: { label: 'Baking in Progress', emoji: '🔥', message: 'Your cake is in the oven! The magic is happening.' },
    READY: { label: 'Ready!', emoji: '🎂', message: 'Your order is ready and awaiting pickup or dispatch.' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', emoji: '🚗', message: 'Your order is on its way to you!' },
    DELIVERED: { label: 'Delivered', emoji: '🎉', message: 'Your order has been delivered. Enjoy every bite!' },
    PICKED_UP: { label: 'Picked Up', emoji: '🎉', message: 'Your order has been picked up. Enjoy!' },
    CANCELLED: { label: 'Order Cancelled', emoji: '❌', message: 'Your order has been cancelled. Contact us if you have questions.' },
};
function orderStatusUpdateTemplate(data) {
    const statusInfo = STATUS_LABELS[data.status] ?? {
        label: data.status,
        emoji: '📦',
        message: data.message ?? 'Your order status has been updated.',
    };
    return {
        subject: `${statusInfo.emoji} Order Update — ${data.orderNumber} | Jayascravings`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1b2a4a;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;">JAYASCRAVINGS</h1>
            <p style="margin:8px 0 0;color:#b8862b;font-size:14px;">Order Update</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="font-size:48px;margin:0 0 16px;">${statusInfo.emoji}</p>
            <h2 style="color:#1b2a4a;margin:0 0 8px;">${statusInfo.label}</h2>
            <p style="color:#555;margin:0 0 24px;">Hi ${data.customerName}, ${statusInfo.message}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f4f1ea;padding:16px;border-radius:6px;text-align:center;">
                  <p style="margin:0;color:#1b2a4a;font-weight:bold;">Order: ${data.orderNumber}</p>
                </td>
              </tr>
            </table>
            ${data.message ? `<p style="color:#555;margin:24px 0 0;font-size:14px;">${data.message}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="background:#f4f1ea;padding:24px 40px;text-align:center;">
            <p style="margin:0;color:#888;font-size:12px;">© 2026 Jayascravings. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    };
}
//# sourceMappingURL=order-status-update.template.js.map
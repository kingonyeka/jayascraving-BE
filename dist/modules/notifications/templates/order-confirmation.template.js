"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderConfirmationTemplate = orderConfirmationTemplate;
function orderConfirmationTemplate(data) {
    const itemRows = data.orderItems
        .map((item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0e8d8;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #f0e8d8;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f0e8d8;text-align:right;">₦${item.price.toLocaleString()}</td>
      </tr>`)
        .join('');
    return {
        subject: `Order Confirmed — ${data.orderNumber} | Jayascravings`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1b2a4a;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">JAYASCRAVINGS</h1>
            <p style="margin:8px 0 0;color:#b8862b;font-size:14px;">Cakes & Confectionery</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#1b2a4a;margin:0 0 8px;">Order Confirmed! 🎂</h2>
            <p style="color:#555;margin:0 0 24px;">Hi ${data.customerName}, your order has been received and confirmed. We'll get baking soon!</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#f4f1ea;padding:16px;border-radius:6px;">
                  <p style="margin:0;color:#1b2a4a;font-weight:bold;">Order Number: ${data.orderNumber}</p>
                  <p style="margin:4px 0 0;color:#555;font-size:14px;">
                    ${data.deliveryType === 'DELIVERY' ? `Delivery${data.deliveryDate ? ` on ${data.deliveryDate}` : ''}` : 'Collection / Pickup'}
                  </p>
                  ${data.deliveryAddress ? `<p style="margin:4px 0 0;color:#555;font-size:14px;">${data.deliveryAddress}</p>` : ''}
                </td>
              </tr>
            </table>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr style="background:#1b2a4a;">
                <th style="padding:10px 8px;color:#fff;text-align:left;font-size:13px;">Item</th>
                <th style="padding:10px 8px;color:#fff;text-align:center;font-size:13px;">Qty</th>
                <th style="padding:10px 8px;color:#fff;text-align:right;font-size:13px;">Price</th>
              </tr>
              ${itemRows}
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:6px 8px;color:#555;">Subtotal</td>
                <td style="padding:6px 8px;text-align:right;color:#555;">₦${data.subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:6px 8px;color:#555;">Delivery Fee</td>
                <td style="padding:6px 8px;text-align:right;color:#555;">₦${data.deliveryFee.toLocaleString()}</td>
              </tr>
              ${data.discount > 0 ? `<tr><td style="padding:6px 8px;color:#27500a;">Discount</td><td style="padding:6px 8px;text-align:right;color:#27500a;">-₦${data.discount.toLocaleString()}</td></tr>` : ''}
              <tr style="border-top:2px solid #1b2a4a;">
                <td style="padding:12px 8px;color:#1b2a4a;font-weight:bold;font-size:16px;">Total</td>
                <td style="padding:12px 8px;text-align:right;color:#1b2a4a;font-weight:bold;font-size:16px;">₦${data.total.toLocaleString()}</td>
              </tr>
            </table>

            <p style="color:#555;font-size:14px;margin:0;">We'll notify you at every step. Questions? Reply to this email.</p>
          </td>
        </tr>
        <!-- Footer -->
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
//# sourceMappingURL=order-confirmation.template.js.map
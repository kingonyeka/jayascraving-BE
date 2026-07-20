"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentReceiptTemplate = paymentReceiptTemplate;
function paymentReceiptTemplate(data) {
    return {
        subject: `Payment Receipt — ${data.orderNumber} | Jayascravings`,
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
            <p style="margin:8px 0 0;color:#b8862b;font-size:14px;">Payment Receipt</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#1b2a4a;margin:0 0 8px;">Payment Successful 💳</h2>
            <p style="color:#555;margin:0 0 32px;">Hi ${data.customerName}, we have received your payment. Thank you!</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:12px;background:#f4f1ea;border-radius:6px 6px 0 0;border-bottom:1px solid #e8e0d0;">
                  <span style="color:#888;font-size:13px;">Order Number</span><br>
                  <strong style="color:#1b2a4a;">${data.orderNumber}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f4f1ea;border-bottom:1px solid #e8e0d0;">
                  <span style="color:#888;font-size:13px;">Amount Paid</span><br>
                  <strong style="color:#1b2a4a;font-size:20px;">₦${data.amount.toLocaleString()}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f4f1ea;border-bottom:1px solid #e8e0d0;">
                  <span style="color:#888;font-size:13px;">Payment Method</span><br>
                  <strong style="color:#1b2a4a;">${data.paymentMethod}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f4f1ea;border-bottom:1px solid #e8e0d0;">
                  <span style="color:#888;font-size:13px;">Reference</span><br>
                  <strong style="color:#1b2a4a;">${data.paymentReference}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:12px;background:#f4f1ea;border-radius:0 0 6px 6px;">
                  <span style="color:#888;font-size:13px;">Paid At</span><br>
                  <strong style="color:#1b2a4a;">${data.paidAt}</strong>
                </td>
              </tr>
            </table>

            <p style="color:#555;font-size:14px;margin:0;">Keep this email as your receipt. Questions? Reply here.</p>
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
//# sourceMappingURL=payment-receipt.template.js.map
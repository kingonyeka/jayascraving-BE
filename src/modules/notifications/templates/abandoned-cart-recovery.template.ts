export interface AbandonedCartRecoveryData {
  customerName: string;
  itemSummary: string; // e.g. "Red Velvet Cake x1, Cupcakes x6"
  itemCount: number;
  cartTotal: number;
  checkoutUrl: string;
}

export function abandonedCartRecoveryTemplate(data: AbandonedCartRecoveryData): {
  subject: string;
  html: string;
} {
  return {
    subject: `You left something delicious behind 🍰 | Jayascravings`,
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
            <p style="margin:8px 0 0;color:#b8862b;font-size:14px;">Your cart is waiting</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="font-size:48px;margin:0 0 16px;">🛒</p>
            <h2 style="color:#1b2a4a;margin:0 0 8px;">Hi ${data.customerName}, you left ${data.itemCount} item(s) in your cart</h2>
            <p style="color:#555;margin:0 0 32px;">${data.itemSummary}</p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f4f1ea;padding:16px;border-radius:6px;text-align:left;">
                  <p style="margin:0;color:#1b2a4a;font-weight:bold;">Cart total: ₦${data.cartTotal.toLocaleString()}</p>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr>
                <td align="center">
                  <a href="${data.checkoutUrl}" style="background:#b8862b;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;display:inline-block;">Complete your order</a>
                </td>
              </tr>
            </table>
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

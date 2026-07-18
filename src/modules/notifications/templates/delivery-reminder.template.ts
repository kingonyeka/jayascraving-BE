export interface DeliveryReminderData {
  customerName: string;
  orderNumber: string;
  deliveryDate: string;
  deliveryTimeSlot?: string;
  deliveryAddress?: string;
}

export function deliveryReminderTemplate(data: DeliveryReminderData): {
  subject: string;
  html: string;
} {
  return {
    subject: `Delivery Reminder — ${data.orderNumber} | Jayascravings`,
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
            <p style="margin:8px 0 0;color:#b8862b;font-size:14px;">Delivery Reminder</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="font-size:48px;margin:0 0 16px;">🚗</p>
            <h2 style="color:#1b2a4a;margin:0 0 8px;">Your order is being delivered tomorrow!</h2>
            <p style="color:#555;margin:0 0 32px;">Hi ${data.customerName}, just a reminder that your Jayascravings order is scheduled for delivery.</p>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#f4f1ea;padding:16px;border-radius:6px;text-align:left;">
                  <p style="margin:0 0 8px;color:#1b2a4a;font-weight:bold;">Order: ${data.orderNumber}</p>
                  <p style="margin:0 0 4px;color:#555;font-size:14px;">📅 Date: ${data.deliveryDate}</p>
                  ${data.deliveryTimeSlot ? `<p style="margin:0 0 4px;color:#555;font-size:14px;">🕐 Time: ${data.deliveryTimeSlot}</p>` : ''}
                  ${data.deliveryAddress ? `<p style="margin:0;color:#555;font-size:14px;">📍 Address: ${data.deliveryAddress}</p>` : ''}
                </td>
              </tr>
            </table>

            <p style="color:#555;font-size:14px;margin:24px 0 0;">Please ensure someone is available to receive your order. Questions? Reply to this email.</p>
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
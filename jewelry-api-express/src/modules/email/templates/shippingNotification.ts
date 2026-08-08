export function shippingNotificationTemplate(data: {
  orderId: string;
  customerName: string;
  trackingNumber: string;
  carrier?: string;
  estimatedDelivery?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid #eee; }
    .logo { font-size: 24px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 300; }
    .content { padding: 30px 0; }
    .tracking-box { background: #1a1a1a; color: white; padding: 24px; text-align: center; margin: 24px 0; }
    .tracking-number { font-size: 20px; letter-spacing: 0.1em; margin-top: 8px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
    .btn { display: inline-block; padding: 14px 32px; background: #1a1a1a; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Lumière</div>
    </div>
    <div class="content">
      <h2 style="font-weight:300;letter-spacing:0.05em;">Your Order Has Shipped</h2>
      <p>Dear ${data.customerName},</p>
      <p>Great news! Your order <strong>${data.orderId}</strong> has been shipped and is on its way to you.</p>

      <div class="tracking-box">
        <p style="margin:0;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">Tracking Number</p>
        <p class="tracking-number">${data.trackingNumber}</p>
        ${data.carrier ? `<p style="margin:8px 0 0;font-size:12px;">Carrier: ${data.carrier}</p>` : ''}
      </div>

      ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}

      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL}" class="btn">Continue Shopping</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Lumière Jewelry. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

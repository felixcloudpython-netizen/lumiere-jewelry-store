export function orderConfirmationTemplate(data: {
  orderId: string;
  customerName: string;
  items: { name: string; quantity: number; price: number; size?: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: any;
  orderDate: string;
}) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">${item.name}${item.size ? ` (Size: ${item.size})` : ''}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('');

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
    .order-info { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    .total-row { font-weight: 600; border-top: 2px solid #1a1a1a; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
    .btn { display: inline-block; padding: 14px 32px; background: #1a1a1a; color: white; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Lumière</div>
      <p style="color:#888;font-size:12px;letter-spacing:0.1em;margin-top:8px;">FINE JEWELRY</p>
    </div>
    <div class="content">
      <h2 style="font-weight:300;letter-spacing:0.05em;">Thank You for Your Order</h2>
      <p>Dear ${data.customerName},</p>
      <p>We have received your order and are preparing it with care. Below are your order details.</p>

      <div class="order-info">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${data.orderId}</p>
        <p style="margin:0 0 8px;"><strong>Date:</strong> ${data.orderDate}</p>
        <p style="margin:0;"><strong>Shipping to:</strong><br/>
        ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br/>
        ${data.shippingAddress.address}${data.shippingAddress.apartment ? ', ' + data.shippingAddress.apartment : ''}<br/>
        ${data.shippingAddress.city}, ${data.shippingAddress.country} ${data.shippingAddress.postalCode}</p>
      </div>

      <table>
        <thead>
          <tr style="border-bottom:2px solid #1a1a1a;">
            <th style="padding:12px;text-align:left;font-weight:500;">Product</th>
            <th style="padding:12px;text-align:center;font-weight:500;">Qty</th>
            <th style="padding:12px;text-align:right;font-weight:500;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr><td colspan="2" style="padding:12px;text-align:right;">Subtotal</td><td style="padding:12px;text-align:right;">$${(data.subtotal / 100).toFixed(2)}</td></tr>
          <tr><td colspan="2" style="padding:12px;text-align:right;">Shipping</td><td style="padding:12px;text-align:right;">$${(data.shipping / 100).toFixed(2)}</td></tr>
          <tr><td colspan="2" style="padding:12px;text-align:right;">Tax</td><td style="padding:12px;text-align:right;">$${(data.tax / 100).toFixed(2)}</td></tr>
          <tr class="total-row"><td colspan="2" style="padding:12px;text-align:right;">Total</td><td style="padding:12px;text-align:right;">$${(data.total / 100).toFixed(2)}</td></tr>
        </tfoot>
      </table>

      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" class="btn">View Order</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Lumière Jewelry. All rights reserved.</p>
      <p style="margin-top:8px;">If you have any questions, contact us at support@lumiere-jewelry.com</p>
    </div>
  </div>
</body>
</html>
  `;
}

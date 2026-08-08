import { sendEmail } from './email.service';
import { orderConfirmationTemplate } from './templates/orderConfirmation';
import { shippingNotificationTemplate } from './templates/shippingNotification';

export async function sendOrderConfirmation(data: Parameters<typeof orderConfirmationTemplate>[0]) {
  const html = orderConfirmationTemplate(data);
  return sendEmail({
    to: data.shippingAddress.email || '',
    subject: `Order Confirmation - ${data.orderId}`,
    html,
  });
}

export async function sendShippingNotification(
  email: string,
  data: Parameters<typeof shippingNotificationTemplate>[0]
) {
  const html = shippingNotificationTemplate(data);
  return sendEmail({
    to: email,
    subject: `Your Order Has Shipped - ${data.orderId}`,
    html,
  });
}

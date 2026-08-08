"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ReactNode } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export default function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  // `PaymentElement` bên trong `children` cần biết đang thanh toán cho
  // PaymentIntent nào — phải truyền `clientSecret` vào đây, nếu không
  // `stripe.confirmPayment()` ở PaymentForm.tsx sẽ luôn lỗi.
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
}

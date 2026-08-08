"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import StripeProvider from "@/app/components/stripe/StripeProvider";
import PaymentForm from "@/app/components/stripe/PaymentForm";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface PaymentStepProps {
  orderId: string;
  onSuccess: () => void;
}

export default function PaymentStep({ orderId, onSuccess }: PaymentStepProps) {
  const t = useTranslations("checkout");
  const token = useAuthStore((s) => s.token);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError(t("needLoginToPay"));
      return;
    }

    // Gọi thẳng domain API thật (NEXT_PUBLIC_API_URL) kèm Bearer token — trước đây
    // dùng đường dẫn tương đối "/api/payments/create-intent", vốn sẽ gọi nhầm vào
    // chính domain frontend (không có route Next.js API nào khớp) và luôn 404 ở
    // production, vì frontend/backend nằm trên 2 domain khác nhau; đồng thời route
    // này bắt buộc phải có Bearer token (payments.routes.ts yêu cầu `authenticate`).
    apiFetch<{ clientSecret: string }>("/api/payments/create-intent", {
      method: "POST",
      token,
      body: { orderId },
    })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError(err instanceof ApiError ? err.message : t("paymentInitError")));
  }, [orderId, token, t]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <PaymentForm
        orderId={orderId}
        onSuccess={onSuccess}
        onError={setError}
      />
    </StripeProvider>
  );
}

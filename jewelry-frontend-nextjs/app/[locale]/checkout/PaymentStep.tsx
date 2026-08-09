"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface PaymentStepProps {
  orderId: string;
}

/**
 * Khác hẳn với Stripe trước đây (nhúng form thẻ ngay trong trang qua Stripe
 * Elements), payOS hoạt động theo mô hình CHUYỂN HƯỚNG TOÀN TRANG: khách được
 * đưa sang 1 trang do payOS host (hiện mã QR chuyển khoản ngân hàng), thanh
 * toán xong payOS tự đưa khách quay lại `returnUrl` (trỏ về /checkout/success
 * — xem payos.service.ts phía backend). Không có cách nào nhúng payOS ngay
 * trong trang của mình như Stripe Elements.
 *
 * Việc XÁC NHẬN thanh toán thành công thật sự nằm ở webhook phía backend
 * (payos.service.ts -> handlePaymentWebhook), không phải ở component này —
 * trang /checkout/success chỉ ĐỌC LẠI trạng thái đơn hàng từ server để hiển
 * thị, không tự ý coi là thành công chỉ vì được redirect tới đó.
 */
export default function PaymentStep({ orderId }: PaymentStepProps) {
  const t = useTranslations("checkout");
  const token = useAuthStore((s) => s.token);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError(t("needLoginToPay"));
      return;
    }

    apiFetch<{ checkoutUrl: string }>("/api/payments/create-checkout", {
      method: "POST",
      token,
      body: { orderId },
    })
      .then((data) => {
        // Chuyển hướng toàn trang sang trang thanh toán payOS — không phải
        // gọi API ngầm, đây là điều hướng trình duyệt thật sự.
        window.location.href = data.checkoutUrl;
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : t("paymentInitError")));
  }, [orderId, token, t]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      <p className="text-sm text-neutral-500">{t("redirectingToPayment")}</p>
    </div>
  );
}

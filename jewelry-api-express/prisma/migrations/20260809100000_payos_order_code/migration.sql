-- Đổi tên cột paymentIntentId (thuật ngữ Stripe) thành paymentLinkId (thuật ngữ payOS)
ALTER TABLE "Order" RENAME COLUMN "paymentIntentId" TO "paymentLinkId";

-- Thêm orderCode: số nguyên tự tăng, duy nhất — payOS bắt buộc orderCode phải
-- là integer, không chấp nhận cuid dạng chuỗi như Order.id. Dùng SERIAL để
-- Postgres tự backfill giá trị tăng dần cho các order đã có sẵn (nếu có),
-- không để NULL.
ALTER TABLE "Order" ADD COLUMN "orderCode" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

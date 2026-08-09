# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Next.js "đóng băng" các biến NEXT_PUBLIC_* vào bundle JS ngay lúc `next build`,
# KHÔNG đọc lại ở runtime. Trước đây các biến này chỉ được set ở `environment:` của
# docker-compose (runtime) nên vô tác dụng — build ra sẽ rơi về giá trị fallback
# trong code (vd. "http://localhost:3001") và Stripe không khởi tạo được vì thiếu
# publishable key. Phải truyền vào dưới dạng build ARG rồi set thành ENV TRƯỚC khi
# chạy `npm run build`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
# next.config.js được Next.js đọc lại NGAY LÚC SERVER CHẠY THẬT (không chỉ lúc
# build) — đây là nơi khai báo domain ảnh ngoài được phép tối ưu hoá
# (images.remotePatterns, gồm res.cloudinary.com). Thiếu file này, Next.js dùng
# cấu hình mặc định (không cho phép domain ảnh nào), nên mọi ảnh Cloudinary bị
# endpoint /_next/image từ chối với lỗi "url parameter is not allowed", dù ảnh
# đã upload lên Cloudinary thành công. i18n.ts đi kèm vì next.config.js có
# tham chiếu tới nó qua createNextIntlPlugin('./i18n.ts').
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/i18n.ts ./i18n.ts

EXPOSE 3000

CMD ["npm", "start"]

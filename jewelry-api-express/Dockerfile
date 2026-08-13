# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Alpine Linux mặc định không có sẵn OpenSSL — Prisma engine cần nó để hoạt động.
# Thiếu dòng này: lỗi "Prisma failed to detect the libssl/openssl version" +
# "Could not parse schema engine response" khiến container khởi động rồi crash
# liên tục ngay khi chạy `prisma migrate deploy`/`prisma generate`.
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Cần cài lại ở đây vì đây là stage cuối cùng thực sự CHẠY ứng dụng — image gốc
# node:20-alpine của stage "runner" này không tự động có sẵn openssl từ stage
# "builder" ở trên (mỗi stage là 1 filesystem độc lập).
RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]

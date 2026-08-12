-- Thêm 2 cột optional cho Category — dùng để hiện trong mega menu (mục "Trang
-- sức"), thay cho việc hardcode cứng như trước đây. Cả 2 đều nullable nên
-- không ảnh hưởng gì tới các category đã có sẵn.
ALTER TABLE "Category" ADD COLUMN "description" TEXT;
ALTER TABLE "Category" ADD COLUMN "image" TEXT;

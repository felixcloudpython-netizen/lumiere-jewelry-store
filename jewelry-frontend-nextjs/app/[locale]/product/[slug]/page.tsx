import { notFound } from 'next/navigation';
import { Product } from '@/types';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';

// Trước đây hàm này trả về 1 trong 2 sản phẩm hardcode sẵn trong code (mock),
// hoàn toàn không liên quan tới sản phẩm thật trong DB — sản phẩm tạo qua Admin
// không bao giờ hiển thị được ở đây. Giờ gọi thẳng API thật (route public,
// không cần đăng nhập). `cache: 'no-store'` vì tồn kho/giá có thể đổi thường
// xuyên qua Admin, không muốn cache cũ.
async function getProduct(slug: string): Promise<Product | null> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Không còn `generateStaticParams` với danh sách slug giả cố định — trang giờ
// render động theo từng request, khớp đúng sản phẩm thật trong DB tại thời
// điểm khách truy cập, dù đó là sản phẩm mới tạo 1 phút trước qua Admin.
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} />
        </div>
      </div>
    </main>
  );
}

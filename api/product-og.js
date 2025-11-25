// File: /api/product-og.js
export default async function handler(request, response) {
  const { id } = request.query;

  try {
    // 1. Gọi API Backend để lấy thông tin sản phẩm
    // Lưu ý: Đảm bảo API này chạy nhanh để Bot không bị timeout
    const apiResponse = await fetch(
      `https://dev.nguyenmanhcuong.id.vn/api/product/${id}`,
      { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!apiResponse.ok) {
        throw new Error('API Error');
    }

    const data = await apiResponse.json();
    const product = data.result || {};

    // 2. Chuẩn bị dữ liệu (Fallback nếu thiếu)
    const productName = product.name || 'VNHI Store - Giày Thể Thao Chính Hãng';
    // Cắt ngắn mô tả để chuẩn SEO (khoảng 150-160 ký tự)
    const rawDesc = product.description || 'Chuyên cung cấp giày thể thao chính hãng giá tốt nhất.';
    const productDescription = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...';
    
    // Xử lý ảnh: Phải là Absolute URL (có https://...)
    let productImageUrl = 'https://vnhi-store.vercel.app/default-product.jpg';
    if (product.images && product.images.length > 0 && product.images[0].url) {
        const imgUrl = product.images[0].url;
        productImageUrl = imgUrl.startsWith('http') 
            ? imgUrl 
            : `https://vnhi-store.vercel.app${imgUrl}`; // Thay bằng domain thật của bạn
    }

    const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${id}`;
    const price = product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : '';

    // 3. Trả về HTML tĩnh chứa Meta Tags
    const html = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${productName} | VNHI Store</title>
        <meta name="description" content="${productDescription}">
        
        <meta property="og:type" content="product" />
        <meta property="og:title" content="${productName} ${price ? '- ' + price : ''}" />
        <meta property="og:description" content="${productDescription}" />
        <meta property="og:image" content="${productImageUrl}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="${canonicalUrl}" />
        <meta property="og:site_name" content="VNHI Store" />
        
        <meta property="og:image:secure_url" content="${productImageUrl}" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${productName}" />
        <meta name="twitter:description" content="${productDescription}" />
        <meta name="twitter:image" content="${productImageUrl}" />
      </head>
      <body>
        <h1>${productName}</h1>
        <p>${productDescription}</p>
        <img src="${productImageUrl}" alt="${productName}" />
      </body>
      </html>
    `;

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache control: Cache trên CDN Vercel 1 giờ để Bot truy cập nhanh hơn vào lần sau
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).send(html);

  } catch (error) {
    console.error('OG Generation Error:', error);
    // Nếu lỗi, redirect về trang chủ hoặc trả về thẻ mặc định
    return response.status(500).send('Error generating preview');
  }
}
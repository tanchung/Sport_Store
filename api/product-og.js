export default async function handler(request, response) {
  const { id } = request.query;
  const domain = 'https://vnhi-store.vercel.app'; // Domain của bạn

  // 1. Cấu hình mặc định (QUAN TRỌNG: URL phải là link sản phẩm, KHÔNG được là trang chủ)
  const defaultData = {
    title: "VNHI Store - Giày Thể Thao Chính Hãng",
    description: "Chuyên cung cấp các loại giày thể thao chính hãng, uy tín, chất lượng cao.",
    image: `${domain}/logogiay.png`, // Đảm bảo file này nằm trong thư mục public
    url: `${domain}/san-pham/${id}` // <--- SỬA CHỖ NÀY: Luôn trỏ về đúng link sản phẩm
  };

  let meta = { ...defaultData };

  try {
    // Gọi API Backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const apiResponse = await fetch(
      `https://dev.nguyenmanhcuong.id.vn/api/product/${id}`,
      { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Vercel-Edge-Function' }
      }
    );
    clearTimeout(timeoutId);

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      const product = data.result;

      if (product) {
        meta.title = product.name || defaultData.title;
        const rawDesc = product.description || defaultData.description;
        meta.description = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...';
        
        if (product.images && product.images.length > 0) {
          const imgUrl = product.images[0].url;
          // Xử lý nối chuỗi ảnh an toàn
          meta.image = imgUrl.startsWith('http') ? imgUrl : `${domain}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
        }
        
        if (product.price) {
           const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
           meta.title = `${meta.title} - ${price}`;
        }
      }
    } else {
        console.error("API trả về lỗi:", apiResponse.status);
    }
  } catch (error) {
    console.error("Lỗi khi fetch API sản phẩm:", error);
    // Code sẽ tự dùng defaultData, nhưng giờ defaultData.url đã đúng là link sản phẩm
  }

  // Trả về HTML
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${meta.title}</title>
      <meta name="description" content="${meta.description}">
      
      <meta property="og:type" content="product" />
      <meta property="og:url" content="${meta.url}" />
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}" />
      <meta property="og:image" content="${meta.image}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="VNHI Store" />
      
      <meta property="og:image:secure_url" content="${meta.image}" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}" />
      <meta name="twitter:image" content="${meta.image}" />
    </head>
    <body>
      <h1>${meta.title}</h1>
      <p>${meta.description}</p>
      <img src="${meta.image}" />
    </body>
    </html>
  `;

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Xóa cache cũ ngay lập tức để test
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); 
  return response.status(200).send(html);
}
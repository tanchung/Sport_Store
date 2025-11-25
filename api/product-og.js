export default async function handler(request, response) {
  const { id } = request.query;

  // Cấu hình mặc định (Fallback) - Dùng khi không lấy được sản phẩm
  const defaultData = {
    title: "VNHI Store - Giày Thể Thao Chính Hãng",
    description: "Chuyên cung cấp các loại giày thể thao chính hãng, uy tín, chất lượng cao.",
    image: "https://vnhi-store.vercel.app/assets/logogiay.png", // Đảm bảo link ảnh này tồn tại
    url: "https://vnhi-store.vercel.app"
  };

  let meta = { ...defaultData };

  try {
    // 1. Gọi API Backend (Thêm timeout để không bị treo quá lâu)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // Timeout sau 4s

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
        // Xử lý mô tả: Xóa tag HTML, cắt ngắn
        const rawDesc = product.description || defaultData.description;
        meta.description = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...';
        
        // Xử lý ảnh
        if (product.images && product.images.length > 0) {
          const imgUrl = product.images[0].url;
          meta.image = imgUrl.startsWith('http') ? imgUrl : `https://vnhi-store.vercel.app${imgUrl}`;
        }
        
        meta.url = `https://vnhi-store.vercel.app/san-pham/${id}`;
        
        // Thêm giá tiền vào tiêu đề cho hấp dẫn
        if (product.price) {
           const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
           meta.title = `${meta.title} - ${price}`;
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi fetch API sản phẩm:", error);
    // Không làm gì cả, giữ nguyên meta mặc định để trả về -> Tránh lỗi 500
  }

  // 2. Trả về HTML tĩnh (Server Side Rendered HTML)
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
  response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache ngắn hơn để test
  return response.status(200).send(html);
}
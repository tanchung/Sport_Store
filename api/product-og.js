export default async function handler(request, response) {
  const { id } = request.query;
  const domain = 'https://vnhi-store.vercel.app';

  // --- ĐÂY LÀ LINK API TỪ ẢNH BẠN GỬI ---
  // Tôi đã thay số 17 thành ${id} để nó động
  const API_URL = `https://unrealistic-elton-denunciable.ngrok-free.dev/api/products/getproduct/${id}/id`; 
  // ----------------------------------------

  // Cấu hình mặc định (Phòng khi API lỗi/ngrok tắt thì vẫn hiện web đẹp)
  const defaultData = {
    title: "VNHI Store - Giày Thể Thao Chính Hãng",
    description: "Chuyên cung cấp giày thể thao uy tín, chất lượng cao.",
    image: `${domain}/logogiay.png`, 
    url: `${domain}/san-pham/${id}`
  };

  let meta = { ...defaultData };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 giây timeout

    // Thêm header ngrok-skip-browser-warning để tránh màn hình chờ của ngrok
    const apiResponse = await fetch(API_URL, { 
        signal: controller.signal,
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'ngrok-skip-browser-warning': 'true' 
        }
    });
    clearTimeout(timeoutId);

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      
      // Vì không biết chính xác data trả về nằm ở đâu, tôi check cả 3 trường hợp phổ biến
      const product = data.result || data.data || data; 

      if (product) {
        meta.title = product.name || defaultData.title;
        
        // Xử lý mô tả
        const rawDesc = product.description || defaultData.description;
        meta.description = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 155) + '...';
        
        // Xử lý ảnh
        if (product.images && product.images.length > 0) {
           const imgUrl = product.images[0].downloadUrl;
           if (imgUrl.startsWith('http')) {
               meta.image = imgUrl;
           } else {
               meta.image = `${domain}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
           }
        }
        
        // Giá tiền
        if (product.price) {
            const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
            meta.title = `${meta.title} - ${price}`;
        }
      }
    }
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error.message);
  }

  // Trả về HTML cho Facebook
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
  response.setHeader('Cache-Control', 'no-cache, no-store'); 
  return response.status(200).send(html);
}
export const config = {
  matcher: '/san-pham/:id*', // Chỉ áp dụng cho các đường dẫn sản phẩm
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // ✅ Nhận diện bot / crawler phổ biến (Facebook, Zalo, Twitter, etc.)
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|pinterest|googlebot|baiduspider|embedly|quora|Discordbot|TelegramBot|ZaloShareAgent/i.test(
    userAgent
  );

  if (isCrawler) {
    try {
      const url = new URL(request.url);
      const productId = url.pathname.split('/').pop();

      if (!productId) throw new Error('Thiếu product ID');

      // ✅ (1) Gọi API backend của bạn để lấy thông tin sản phẩm
      const apiResponse = await fetch(
        `https://unrealistic-elton-denunciable.ngrok-free.dev/api/products/${productId}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          cache: 'no-cache',
        }
      );

      if (!apiResponse.ok) throw new Error('API trả lỗi');

      const data = await apiResponse.json();
      const product = data.result || {};

      // ✅ (2) Chuẩn hóa dữ liệu sản phẩm
      const productName = product.name || 'Sản phẩm VNHI';
      const rawDescription =
        product.description ||
        `Mua ${productName} chính hãng tại VNHI Store – giá tốt, giao hàng nhanh.`;
      const productDescription = rawDescription.substring(0, 155);
      const productImageRaw = product.images?.[0]?.url || '/default-product.jpg';
      const productImageUrl = productImageRaw.startsWith('http')
        ? productImageRaw
        : `https://vnhi-store.vercel.app${productImageRaw}`;

      const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${productId}`;
      const brandName = product.brand?.name || 'VNHI Store';

      // ✅ (3) Render HTML có sẵn OG tags để crawler đọc
      const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>${productName} | VNHI Store</title>
    <meta name="description" content="${productDescription}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />

    <!-- ✅ Open Graph -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${productName}" />
    <meta property="og:description" content="${productDescription}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${productImageUrl}" />
    <meta property="og:image:secure_url" content="${productImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="VNHI Store" />
    <meta property="og:locale" content="vi_VN" />

    ${product.price ? `<meta property="product:price:amount" content="${product.price}" />` : ''}
    ${product.price ? `<meta property="product:price:currency" content="VND" />` : ''}
    ${brandName ? `<meta property="product:brand" content="${brandName}" />` : ''}

    <!-- ✅ Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${productName}" />
    <meta name="twitter:description" content="${productDescription}" />
    <meta name="twitter:image" content="${productImageUrl}" />

    <!-- ✅ SEO thêm -->
    <meta name="theme-color" content="#ffffff" />
    <meta name="keywords" content="${productName}, ${brandName}, giày thể thao, mua giày online, vnhi store" />
  </head>

  <body>
    <h1>${productName}</h1>
    <p>${productDescription}</p>
  </body>
</html>`;

      // ✅ (4) Trả về HTML cho Facebook / Zalo Bot
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      });
    } catch (error) {
      console.error('❌ Lỗi middleware crawler:', error);
      // Nếu lỗi, cứ trả trang như bình thường để người dùng không bị ảnh hưởng
      return;
    }
  }

  // ✅ Nếu không phải bot, cho phép tiếp tục (React handle)
  return;
}
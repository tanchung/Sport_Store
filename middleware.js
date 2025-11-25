import { NextResponse } from 'next/server';

export const config = {
  matcher: '/san-pham/:id*',
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|pinterest|googlebot|ZaloShareAgent/i.test(userAgent);

  if (isCrawler) {
    try {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const productId = pathParts[pathParts.length - 1];

      if (!productId) return NextResponse.next();

      const apiResponse = await fetch(
        `https://dev.nguyenmanhcuong.id.vn/api/product/${productId}`,
        { cache: 'no-cache' }
      );

      if (!apiResponse.ok) return NextResponse.next();

      const data = await apiResponse.json();
      const product = data.result || {};

      const productName = product.name || 'Sản phẩm VNHI';
      const rawDescription = product.description || `Mua ${productName} chính hãng.`;
      const productDescription = rawDescription.substring(0, 155);
      const productImageRaw = product.images?.[0]?.url || '/default-product.jpg';
      const productImageUrl = productImageRaw.startsWith('http')
        ? productImageRaw
        : `https://vnhi-store.vercel.app${productImageRaw}`;
      const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${productId}`;
      const brandName = product.brand?.name || product.brand || 'VNHI Store';

      const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>${productName} | VNHI Store</title>
    <meta name="description" content="${productDescription}" />
    <link rel="canonical" href="${canonicalUrl}" />
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
    <meta property="product:brand" content="${brandName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${productName}" />
    <meta name="twitter:description" content="${productDescription}" />
    <meta name="twitter:image" content="${productImageUrl}" />
  </head>
  <body>
    <h1>${productName}</h1>
    <p>${productDescription}</p>
  </body>
</html>`;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      console.error('Middleware error:', error);
    }
  }

  return NextResponse.next();
}
export default async function handler(request, response) {
  const userAgent = request.headers['user-agent'] || '';
  const { id } = request.query;

  // Detect crawler
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|pinterest|ZaloShareAgent/i.test(userAgent);

  if (!isCrawler) {
    // Không phải crawler → redirect về index.html (React sẽ handle)
    return response.redirect(307, `/index.html#/san-pham/${id}`);
  }

  try {
    // Fetch product data
    const apiResponse = await fetch(
      `https://dev.nguyenmanhcuong.id.vn/api/product/${id}`,
      { cache: 'no-cache' }
    );

    if (!apiResponse.ok) throw new Error('API error');

    const data = await apiResponse.json();
    const product = data.result || {};

    const productName = product.name || 'Sản phẩm VNHI';
    const rawDescription = product.description || `Mua ${productName} chính hãng tại VNHI Store.`;
    const productDescription = rawDescription.substring(0, 155);
    const productImageRaw = product.images?.[0]?.url || '/default-product.jpg';
    const productImageUrl = productImageRaw.startsWith('http')
      ? productImageRaw
      : `https://vnhi-store.vercel.app${productImageRaw}`;
    const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${id}`;
    const brandName = product.brand?.name || product.brand || 'VNHI Store';

    const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <title>${productName} | VNHI Store</title>
    <meta name="description" content="${productDescription}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph -->
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

    <!-- Twitter Card -->
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
</html>`;

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return response.status(200).send(html);

  } catch (error) {
    console.error('Error in product-og:', error);
    return response.redirect(307, `/index.html#/san-pham/${id}`);
  }
}

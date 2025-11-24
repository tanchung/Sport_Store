export const config = {
  matcher: '/san-pham/:id*',
};

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect crawlers/bots
  const isCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Slackbot|pinterest|googlebot/i.test(userAgent);
  
  if (isCrawler) {
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();
    
    if (productId && /^\d+$/.test(productId)) {
      try {
        // Fetch product data from API
        const apiResponse = await fetch(
          `https://unrealistic-elton-denunciable.ngrok-free.dev/api/products/${productId}`,
          {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          const product = data.result;
          
          const productName = product.name || 'Sản phẩm';
          const productDescription = (product.description || '').substring(0, 155);
          const productImage = product.images?.[0]?.url || '';
          const productImageUrl = productImage.startsWith('http') 
            ? productImage 
            : `https://vnhi-store.vercel.app${productImage}`;
          const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${productId}`;
          
          // Generate HTML with product-specific meta tags
          const html = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/src/assets/logogiay.png" />
    
    <!-- SEO Meta Tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${productName} | VNHI Store</title>
    <meta name="description" content="${productDescription}" />
    <meta name="keywords" content="${productName}, ${product.brand?.name || ''}, giày thể thao, mua online" />
    <link rel="canonical" href="${canonicalUrl}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${productName}" />
    <meta property="og:description" content="${productDescription}" />
    <meta property="og:image" content="${productImageUrl}" />
    <meta property="og:image:secure_url" content="${productImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${productName}" />
    <meta property="og:site_name" content="VNHI Store" />
    <meta property="og:locale" content="vi_VN" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${productName}" />
    <meta name="twitter:description" content="${productDescription}" />
    <meta name="twitter:image" content="${productImageUrl}" />
    
    <!-- Product Info -->
    ${product.price ? `<meta property="product:price:amount" content="${product.price}" />` : ''}
    ${product.price ? `<meta property="product:price:currency" content="VND" />` : ''}
    ${product.brand?.name ? `<meta property="product:brand" content="${product.brand.name}" />` : ''}
    
    <!-- Additional SEO -->
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index, follow" />
    <meta name="theme-color" content="#ffffff" />
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />

    <!-- ShareThis Script -->
    <script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=69242f0f7358636aee2d0cf6&product=inline-share-buttons' async='async' id="sharethis-script"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
          
          return new Response(html, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
          });
        }
      } catch (error) {
        console.error('Error fetching product for crawler:', error);
      }
    }
  }
  
  // For normal users, continue as usual
  return;
}

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).send('Missing product ID');
  }
  
  try {
    // Gọi API backend để lấy thông tin sản phẩm
    const apiUrl = `https://unrealistic-elton-denunciable.ngrok-free.dev/api/products/${id}`;
    const response = await fetch(apiUrl, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const product = data.result;
      
      // Tạo meta tags động
      const productName = product.name || 'Sản phẩm';
      const productDescription = (product.description || '').substring(0, 155);
      const productImage = product.images?.[0]?.url || '/default-product.jpg';
      const productImageUrl = productImage.startsWith('http') ? productImage : `https://vnhi-store.vercel.app${productImage}`;
      const canonicalUrl = `https://vnhi-store.vercel.app/san-pham/${id}`;
      
      // Tạo HTML với meta tags động
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
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
      rel="stylesheet"
    />

    <!-- ShareThis Script -->
    <script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=69242f0f7358636aee2d0cf6&product=inline-share-buttons' async='async' id="sharethis-script"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      res.status(200).send(html);
    } else {
      // Nếu không tìm thấy sản phẩm, redirect về trang chủ hoặc 404
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Internal Server Error');
  }
}

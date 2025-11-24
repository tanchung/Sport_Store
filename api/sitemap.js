// Vercel Serverless Function to generate sitemap.xml
// This will be accessible at /api/sitemap

export default async function handler(req, res) {
  try {
    const baseUrl = 'https://vnhi-store.vercel.app';
    const backendUrl = 'https://unrealistic-elton-denunciable.ngrok-free.dev';
    
    // Fetch products from backend
    let products = [];
    try {
      const productsResponse = await fetch(`${backendUrl}/api/product/getAll?page=0&size=1000`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const productsData = await productsResponse.json();
      products = productsData?.result?.content || [];
    } catch (error) {
      console.error('Error fetching products:', error);
    }

    // Fetch categories
    let categories = [];
    try {
      const categoriesResponse = await fetch(`${backendUrl}/api/category/getAllCategories`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      const categoriesData = await categoriesResponse.json();
      categories = categoriesData?.result || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    const currentDate = new Date().toISOString();
    
    // Static pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/san-pham', changefreq: 'daily', priority: '0.9' },
      { url: '/gioi-thieu', changefreq: 'monthly', priority: '0.7' },
      { url: '/lien-he', changefreq: 'monthly', priority: '0.7' },
      { url: '/huong-dan/mua-hang', changefreq: 'monthly', priority: '0.6' },
      { url: '/huong-dan/thanh-toan', changefreq: 'monthly', priority: '0.6' },
      { url: '/chinh-sach/doi-tra', changefreq: 'monthly', priority: '0.5' },
      { url: '/chinh-sach/van-chuyen', changefreq: 'monthly', priority: '0.5' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add product pages
    products.forEach(product => {
      const productDate = product.updatedAt || currentDate;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/san-pham/${product.id}</loc>\n`;
      xml += `    <lastmod>${productDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      
      // Add product image
      if (product.images && product.images.length > 0) {
        const imageUrl = product.images[0].url || product.images[0].downloadUrl || '';
        if (imageUrl) {
          const escapedName = escapeXml(product.name || 'Product');
          xml += '    <image:image>\n';
          xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
          xml += `      <image:title>${escapedName}</image:title>\n`;
          xml += '    </image:image>\n';
        }
      }
      
      xml += '  </url>\n';
    });

    // Add category pages
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/bo-suu-tap/${category.id}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Set proper headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=7200');
    res.status(200).send(xml);
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

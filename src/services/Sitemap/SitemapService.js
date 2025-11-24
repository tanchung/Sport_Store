// Sitemap Generator Service
// This generates a dynamic XML sitemap for VNHI Store

class SitemapService {
  static generateXML(products = [], categories = []) {
    const baseUrl = 'https://vnhi-store.vercel.app';
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
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/san-pham/${product.id}</loc>\n`;
      xml += `    <lastmod>${product.updatedAt || currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      
      // Add product image
      if (product.images && product.images.length > 0) {
        xml += '    <image:image>\n';
        xml += `      <image:loc>${product.images[0].url || product.images[0].downloadUrl}</image:loc>\n`;
        xml += `      <image:title>${this.escapeXml(product.name)}</image:title>\n`;
        xml += '    </image:image>\n';
      }
      
      xml += '  </url>\n';
    });

    // Add category/collection pages
    categories.forEach(category => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/bo-suu-tap/${category.id}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    
    return xml;
  }

  static escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
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

  static async generateAndDownload() {
    try {
      // Import services
      const ProductService = (await import('./Product/ProductServices')).default;
      const CategoryService = (await import('./Category/CategoryServices')).default;

      // Fetch all products and categories
      const [productsRes, categoriesRes] = await Promise.all([
        ProductService.getAllProducts(0, 1000), // Get up to 1000 products
        CategoryService.getAllCategories()
      ]);

      const products = productsRes?.data?.content || [];
      const categories = categoriesRes?.data || [];

      // Generate XML
      const xmlContent = this.generateXML(products, categories);

      // Create blob and download
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Sitemap generated successfully!' };
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return { success: false, message: 'Failed to generate sitemap' };
    }
  }
}

export default SitemapService;

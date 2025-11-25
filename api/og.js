export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Extract product ID from URL
  const match = url.match(/\/san-pham\/(\d+)/);
  if (!match) {
    return res.json({
      title: 'VNHI Store - Cửa Hàng Giày Thể Thao',
      description: 'Mua giày thể thao chính hãng',
      image: 'https://vnhi-store.vercel.app/default.jpg'
    });
  }

  const productId = match[1];
  
  try {
    // Fetch product data from your API
    const response = await fetch(`https://dev.nguyenmanhcuong.id.vn/api/product/${productId}`);
    const data = await response.json();
    
    if (data.code === 200 && data.result) {
      const product = data.result;
      return res.json({
        title: product.name || 'Sản phẩm',
        description: product.description?.substring(0, 155) || 'Mua sản phẩm chính hãng',
        image: product.images?.[0]?.url || 'https://vnhi-store.vercel.app/default.jpg',
        price: product.price,
        brand: product.brand?.name || product.brand
      });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
  
  return res.json({
    title: 'VNHI Store',
    description: 'Sản phẩm không tồn tại',
    image: 'https://vnhi-store.vercel.app/default.jpg'
  });
}

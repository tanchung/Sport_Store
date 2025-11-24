import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductImages from './Components/ProductImages';
import ProductInfo from './Components/ProductInfo';
import Reviews from './Components/ProductReview';
import RelatedProducts from './Components/RelatedProducts';
import LoadingState from '../Products/Components/LoadingState';
import ErrorState from '../Products/Components/ErrorState';
import NotFound from './Components/ProductNotFound';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import ProductService from '../../services/Product/ProductServices';
import { InfoCircleOutlined, CheckCircleOutlined, StarOutlined, SafetyOutlined } from '@ant-design/icons';

// ---------- Component ShareThis ----------
// Component này xử lý việc khởi tạo và truyền data cho ShareThis
const ShareThisButton = ({ url, title, description, image, networks }) => {
  useEffect(() => {
    const initShareThis = () => {
      // Kiểm tra nếu thư viện ShareThis đã tải
      if (window.__sharethis__ && window.__sharethis__.initialize) {
        // Tên class bắt buộc để ShareThis nhận diện vị trí
        // Hàm initialize sẽ đọc data-attributes trên div này
        setTimeout(window.__sharethis__.initialize, 100);
      }
    };
    
    // Nếu ShareThis đã tải, khởi tạo ngay
    if (window.__sharethis__) {
      initShareThis();
    } else {
      // Nếu chưa tải, chờ script tải xong
      const script = document.getElementById('sharethis-script');
      if (script) {
        script.addEventListener('load', () => {
          setTimeout(initShareThis, 100);
        });
      }
    }

    return () => {
      // Dọn dẹp nút cũ để tránh bị trùng lặp khi component bị unmount/mount lại (thay đổi ID sản phẩm)
      const shareButtons = document.querySelector('.sharethis-inline-share-buttons');
      if (shareButtons) {
        shareButtons.innerHTML = '';
      }
    };
  }, [url, title, description, image, networks]); 

  return (
    <div 
      // Class bắt buộc
      className="sharethis-inline-share-buttons" 
      // Thuộc tính dữ liệu để ShareThis lấy thông tin chia sẻ
      data-url={url}
      data-title={title}
      data-description={description}
      data-image={image}
      // networks: Tùy chỉnh các nút (ví dụ: facebook,zalo,messenger)
      data-networks={networks || "facebook,zalo,messenger,twitter,pinterest,email"} 
    ></div>
  );
};


// ---------- Main Component ProductDetail ----------
const ProductDetail = () => {
  useScrollToTop();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product and restore scroll position (Logic của bạn)
  useEffect(() => {
    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem('scrollPosition');
      if (savedPosition !== null) {
        window.scrollTo({ top: parseInt(savedPosition), behavior: 'auto' });
        sessionStorage.removeItem('scrollPosition'); 
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const timer = setTimeout(restoreScrollPosition, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (id) {
          const response = await ProductService.getProductById(id);
          if (response?.data) setProduct(response.data);
          else setError('Không tìm thấy sản phẩm');
        } else setError('Không tìm thấy ID sản phẩm');
      } catch (err) {
        console.error(err);
        setError('Có lỗi xảy ra khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Cập nhật meta tags trực tiếp vào DOM để Facebook crawler thấy ngay
  useEffect(() => {
    if (!product) return;

    const productName = product.name || 'Sản phẩm không tên';
    const rawDescription = product.description || `Mua ${productName} chính hãng, giá tốt. Cam kết chất lượng và giao hàng nhanh.`;
    const productDescription = rawDescription.substring(0, 155) + (rawDescription.length > 155 ? '...' : '');
    
    let productImageUrl = '';
    if (product.images && product.images.length > 0 && product.images[0].url) {
      const imgUrl = product.images[0].url;
      productImageUrl = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl}`;
    } else {
      productImageUrl = `${window.location.origin}/default-product.jpg`;
    }
    
    const canonicalUrl = window.location.href;

    // Helper function để update hoặc tạo meta tag
    const updateMetaTag = (property, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Update title
    document.title = `${productName} | VNHI Store`;

    // Update basic meta tags
    updateMetaTag('description', productDescription);
    updateMetaTag('keywords', `${productName}, ${product.brand?.name || ''}, ${product.category || ''}, giày thể thao, mua online`);

    // Update Open Graph tags
    updateMetaTag('og:type', 'product', true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:title', productName, true);
    updateMetaTag('og:description', productDescription, true);
    updateMetaTag('og:image', productImageUrl, true);
    updateMetaTag('og:image:secure_url', productImageUrl, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', productName, true);
    updateMetaTag('og:site_name', 'VNHI Store', true);
    updateMetaTag('og:locale', 'vi_VN', true);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', canonicalUrl);
    updateMetaTag('twitter:title', productName);
    updateMetaTag('twitter:description', productDescription);
    updateMetaTag('twitter:image', productImageUrl);

    // Update product-specific tags
    if (product.price) {
      updateMetaTag('product:price:amount', product.price.toString(), true);
      updateMetaTag('product:price:currency', 'VND', true);
    }
    if (product.brand?.name) {
      updateMetaTag('product:brand', product.brand.name, true);
    }

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

  }, [product]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!product) return <NotFound />;

  // --- LOGIC TẠO DỮ LIỆU CHO THẺ META VÀ OG ---
  const productName = product.name || 'Sản phẩm không tên';
  const rawDescription = product.description || `Mua ${productName} chính hãng, giá tốt. Cam kết chất lượng và giao hàng nhanh.`;
  const productDescription = rawDescription.substring(0, 155) + (rawDescription.length > 155 ? '...' : '');
  
  // Đảm bảo URL hình ảnh là tuyệt đối (bắt buộc cho Facebook)
  let productImageUrl = '';
  if (product.images && product.images.length > 0 && product.images[0].url) {
    const imgUrl = product.images[0].url;
    // Kiểm tra nếu URL đã có http/https thì giữ nguyên, nếu không thì thêm origin
    productImageUrl = imgUrl.startsWith('http') ? imgUrl : `${window.location.origin}${imgUrl}`;
  } else {
    productImageUrl = `${window.location.origin}/default-product.jpg`;
  }
  
  const canonicalUrl = window.location.href;
  const dimension = product.dimensions?.[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Helmet SEO */}
      <Helmet>
        <title>{productName}</title>
        <meta name="description" content={productDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={`${productName}, ${product.brand?.name || ''}, ${product.category || ''}, mua online, sữa`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={productName} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImageUrl} />
        <meta property="og:image:secure_url" content={productImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={productName} />
        <meta property="og:site_name" content="VNHI - Cửa hàng sữa" />
        <meta property="og:locale" content="vi_VN" />
        
        {/* Product-specific OG tags */}
        {product.price && (
          <>
            <meta property="product:price:amount" content={product.price} />
            <meta property="product:price:currency" content="VND" />
          </>
        )}
        {product.brand?.name && (
          <meta property="product:brand" content={product.brand.name} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={productName} />
        <meta name="twitter:description" content={productDescription} />
        <meta name="twitter:image" content={productImageUrl} />
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-blue-600">Trang chủ</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/san-pham" className="text-gray-500 hover:text-blue-600">Sản phẩm</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="font-medium text-gray-800 truncate">{product.name}</span>
      </nav>

      {/* Product Main */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductImages product={product} />
          <ProductInfo product={product} />
        </div>

        {/* ShareThis Integration */}
        <div className="mt-6 border-t pt-4">
          <h4 className="text-gray-700 font-medium mb-3">Chia sẻ sản phẩm này:</h4>
          {/* Sử dụng component ShareThisButton */}
          <ShareThisButton 
            url={canonicalUrl}
            title={productName}
            description={productDescription}
            image={productImageUrl}
            // Tùy chỉnh các nút hiển thị ở đây
            networks="facebook,zalo,messenger,email,twitter" 
          />
        </div>
      </div>

      {/* Tabs: Description & Specifications */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('description')}
          >
            Thông tin chi tiết
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'specifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('specifications')}
          >
            Thông số sản phẩm
          </button>
        </div>

        <div className="prose max-w-none">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><InfoCircleOutlined className="text-blue-500" /></div>
                <div className="flex-1"><h3 className="font-medium text-gray-800 mb-2">Giới thiệu sản phẩm</h3><p className="text-gray-700">{product.description}</p></div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><CheckCircleOutlined className="text-green-500" /></div>
                <div className="flex-1"><h3 className="font-medium text-gray-800 mb-2">Lợi ích sản phẩm</h3><p className="text-gray-700">Sản phẩm cung cấp nhiều dưỡng chất thiết yếu, hỗ trợ sức khỏe và phát triển toàn diện.</p></div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><StarOutlined className="text-yellow-500" /></div>
                <div className="flex-1"><h3 className="font-medium text-gray-800 mb-2">Đặc điểm nổi bật</h3><p className="text-gray-700">Sản phẩm được sản xuất theo công nghệ hiện đại, đảm bảo chất lượng và an toàn.</p></div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><SafetyOutlined className="text-red-500" /></div>
                <div className="flex-1"><h3 className="font-medium text-gray-800 mb-2">Hướng dẫn sử dụng</h3><p className="text-gray-700">Bảo quản nơi khô ráo, thoáng mát. Sử dụng theo hướng dẫn trên bao bì.</p></div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Thương hiệu:</span> <span className="text-gray-600">{product.brand?.name || product.brand || 'Không có thông tin'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Loại sản phẩm:</span> <span className="text-gray-600">{product.category || 'Sữa'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Mã SKU:</span> <span className="text-gray-600">{product.sku || 'Không có thông tin'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Mã vạch:</span> <span className="text-gray-600">{product.barcode || 'Không có thông tin'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Đơn vị:</span> <span className="text-gray-600">{product.unit?.name || product.unit || 'Không có thông tin'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Trạng thái:</span> <span className="text-gray-600">{product.status?.name || product.status || 'Đang hoạt động'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Số lượng kho:</span> <span className="text-gray-600">{product.stockQuantity || 0}</span></div>
              {dimension && <>
                <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Chiều dài:</span> <span className="text-gray-600">{dimension.lengthValue || 0} cm</span></div>
                <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Chiều rộng:</span> <span className="text-gray-600">{dimension.widthValue || 0} cm</span></div>
                <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Chiều cao:</span> <span className="text-gray-600">{dimension.heightValue || 0} cm</span></div>
                <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Trọng lượng:</span> <span className="text-gray-600">{dimension.weightValue || 0} g</span></div>
              </>}
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Ngày tạo:</span> <span className="text-gray-600">{product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : 'Không có thông tin'}</span></div>
              <div className="flex border-b border-gray-100 py-2"><span className="font-medium w-32">Cập nhật:</span> <span className="text-gray-600">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('vi-VN') : 'Không có thông tin'}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Related */}
      <Reviews productId={id} />
      <RelatedProducts product={product} />
    </div>
  );
};

export default ProductDetail;
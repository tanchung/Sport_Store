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

  // Initialize ShareThis buttons after product loads
  useEffect(() => {
    if (product && window.__sharethis__) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (window.__sharethis__.initialize) {
          window.__sharethis__.initialize();
        }
      }, 100);
    }
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

  // --- SCHEMA.ORG STRUCTURED DATA ---
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "description": productDescription,
    "image": productImageUrl,
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || product.brand || "VNHI Store"
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "VND",
      "price": product.price || 0,
      "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "VNHI - Cửa Hàng Giày Thể Thao"
      }
    },
    "sku": product.sku || `VNHI-${id}`,
    "aggregateRating": product.averageRating ? {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating,
      "reviewCount": product.reviewCount || 0
    } : undefined
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": `${window.location.origin}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Sản phẩm",
        "item": `${window.location.origin}/san-pham`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productName,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Helmet SEO */}
      <Helmet>
        <title>{productName}</title>
        <meta name="description" content={productDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content={`${productName}, ${product.brand?.name || ''}, ${product.category || ''}, mua online, giày thể thao, giày chạy bộ, giày đá bóng`} />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        
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
        <meta property="og:site_name" content="VNHI - Cửa Hàng Giày Thể Thao" />
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
          
          {/* ShareThis BEGIN */}
          <div className="sharethis-inline-share-buttons"></div>
          {/* ShareThis END */}
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
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">Giới thiệu sản phẩm</h3>
                  <p className="text-gray-700 mb-3">{product.description}</p>
                  <p className="text-gray-700">
                    {productName} là sản phẩm chất lượng cao được nhập khẩu và phân phối chính hãng tại Việt Nam. 
                    Sản phẩm đáp ứng các tiêu chuẩn nghiêm ngặt về chất lượng và an toàn, 
                    mang đến cho khách hàng trải nghiệm tốt nhất trong phân khúc giá.
                  </p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><CheckCircleOutlined className="text-green-500" /></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">Lợi ích sản phẩm</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Thiết kế hiện đại, phù hợp với xu hướng thể thao đương đại</li>
                    <li>Chất liệu cao cấp, bền bỉ với thời gian sử dụng lâu dài</li>
                    <li>Đệm êm ái, hỗ trợ tối ưu cho các hoạt động vận động</li>
                    <li>Thương hiệu uy tín, được nhiều vận động viên chuyên nghiệp tin dùng</li>
                    <li>Công nghệ thoát khí tốt, giữ cho bàn chân luôn khô thoáng</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><StarOutlined className="text-yellow-500" /></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">Đặc điểm nổi bật</h3>
                  <p className="text-gray-700 mb-3">
                    Sản phẩm được sản xuất theo công nghệ tiên tiến nhất, đảm bảo độ bền và hiệu suất cao. 
                    Thiết kế ergonomic giúp tối ưu hóa sự thoải mái khi vận động.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Đế giày chống trượt, ma sát cao trên mọi bề mặt</li>
                    <li>Lớp đệm công nghệ hấp thụ lực tác động khi chạy nhảy</li>
                    <li>Trọng lượng nhẹ, không gây cảm giác nặng nề khi di chuyển</li>
                    <li>Kiểm soát chất lượng nghiêm ngặt qua nhiều công đoạn</li>
                    <li>Bảo hành chính hãng, đổi trả dễ dàng trong 30 ngày</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mr-3 mt-1 text-xl"><SafetyOutlined className="text-red-500" /></div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">Hướng dẫn sử dụng và bảo quản</h3>
                  <div className="text-gray-700 space-y-3">
                    <div>
                      <strong className="block mb-1">Sử dụng:</strong>
                      <p>Chọn size phù hợp với kích cỡ chân của bạn. Thử giày và di chuyển nhẹ nhàng để cảm nhận độ vừa vặn. 
                      Nên mang tất khi sử dụng để tăng độ thoải mái và bảo vệ da chân.</p>
                    </div>
                    <div>
                      <strong className="block mb-1">Bảo quản:</strong>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        <li>Vệ sinh bằng khăn ẩm sau mỗi lần sử dụng</li>
                        <li>Phơi khô tự nhiên, tránh ánh nắng trực tiếp</li>
                        <li>Bảo quản nơi khô ráo, thoáng mát</li>
                        <li>Không ngâm giày trong nước quá lâu</li>
                        <li>Sử dụng giấy nhồi vào bên trong khi không đi để giữ form</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="block mb-1">Lưu ý:</strong>
                      <p>Sản phẩm được thiết kế cho các hoạt động thể thao. Nên thay thế sau 6-12 tháng sử dụng thường xuyên 
                      để đảm bảo hiệu suất và độ an toàn tối ưu.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional SEO Content */}
              <div className="flex items-start p-4 bg-blue-50 rounded-lg shadow-sm">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">Tại sao nên chọn mua tại VNHI Store?</h3>
                  <div className="text-gray-700 space-y-2">
                    <p>
                      <strong>VNHI Store</strong> là đơn vị phân phối giày thể thao chính hãng hàng đầu tại Việt Nam với hơn 10 năm kinh nghiệm. 
                      Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chất lượng cao với giá cả cạnh tranh nhất thị trường.
                    </p>
                    <p>
                      <strong>Chính sách khách hàng:</strong> Miễn phí vận chuyển cho đơn hàng trên 500.000đ, 
                      đổi trả trong 30 ngày, bảo hành chính hãng, 
                      thanh toán linh hoạt (COD, chuyển khoản, ví điện tử), 
                      tư vấn tận tâm 24/7 qua hotline và chat online.
                    </p>
                    <p>
                      Hãy đặt hàng ngay hôm nay để nhận được ưu đãi đặc biệt và trải nghiệm dịch vụ mua sắm trực tuyến tốt nhất!
                    </p>
                  </div>
                </div>
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
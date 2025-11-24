import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Alert, Empty } from 'antd';
import CategoryService from '@services/Category/CategoryServices';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

const CollectionDetail = () => {
  const { collectionId } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch collection details and products simultaneously
        const [collectionResponse, productsResponse] = await Promise.all([
          CategoryService.getCollectionById(collectionId),
          CategoryService.getProductsByCollectionId(collectionId)
        ]);

        if (collectionResponse.success) {
          setCollection(collectionResponse.data);
        }

        if (productsResponse.success) {
          setProducts(productsResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError('Không thể tải thông tin bộ sưu tập. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
        <span className="ml-3 text-lg">Đang tải bộ sưu tập...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-4"
        />
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <HiOutlineArrowLeft className="mr-2" />
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Empty
          description="Không tìm thấy bộ sưu tập"
          className="my-8"
        />
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <HiOutlineArrowLeft className="mr-2" />
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      {/* <div className="container mx-auto px-4 py-4">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <HiOutlineArrowLeft className="mr-2" />
          Quay về trang chủ
        </Link>
      </div> */}

      {/* Collection Banner */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={"https://file.hstatic.net/200000278317/collection/main-category-banner-2025-tf_37d6d87196f14a8ca121e4d21bbb3cf9_master.jpg"}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
<div className="absolute inset-0 bg-gradient-to-r from-black/65 via-gray-900/50 to-black/65 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{collection.name}</h1>
            {collection.description && (
              <p className="text-xl max-w-2xl mx-auto">{collection.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Sản phẩm trong bộ sưu tập
          </h2>
          <p className="text-gray-600">
            {products.length} sản phẩm được tìm thấy
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/san-pham/${product.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={product.thumbnail || '/placeholder-image.jpg'}
                    alt={product.name || product.title}
                    className="w-full h-64 object-cover"
                  />
                  {product.discountPercentage > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
                      -{product.discountPercentage}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                    {product.name || product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.discountPercentage > 0 ? (
                        <>
                          <span className="text-lg font-bold text-red-600">
                            {(product.price * (1 - product.discountPercentage / 100)).toLocaleString('vi-VN')}₫
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {product.price?.toLocaleString('vi-VN')}₫
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-800">
                          {product.price?.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            description="Chưa có sản phẩm nào trong bộ sưu tập này"
            className="my-12"
          />
        )}
      </div>
    </div>
  );
};

export default CollectionDetail;

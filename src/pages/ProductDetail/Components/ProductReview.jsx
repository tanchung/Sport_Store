import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ProductService from '../../../services/Product/ProductServices';
import { useAuth } from '../../../context/AuthContext';

const AddReview = ({ productId, onReviewAdded }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const { isAuthenticated, currentUser } = useAuth();

    // Get userId from currentUser
    const getUserId = () => {
        return currentUser?.data?.id ||
               currentUser?.data?.userId ||
               currentUser?.id ||
               currentUser?.userId;
    };

    useEffect(() => {
        const checkReviewEligibility = async () => {
            try {
                setCheckingEligibility(true);
                const response = await ProductService.isAddReview(productId);
                setCanReview(response?.data || false);
            } catch (err) {
                console.error('Error checking review eligibility:', err);
                setCanReview(false);
            } finally {
                setCheckingEligibility(false);
            }
        };

        if (productId && isAuthenticated) {
            checkReviewEligibility();
        } else {
            setCheckingEligibility(false);
            setCanReview(false);
        }
    }, [productId, isAuthenticated]);

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!content || content.trim().length < 30) {
            setError('Nội dung đánh giá phải có ít nhất 30 ký tự');
            return;
        }

        const userId = getUserId();
        if (!userId) {
            setError('Không thể xác định thông tin người dùng');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await ProductService.createReview(productId, userId, rating, content.trim());

            if (response?.success) {
                setSuccess('Đánh giá của bạn đã được gửi thành công!');
                setContent('');
                setRating(0);

                if (onReviewAdded) {
                    onReviewAdded();
                }

                setTimeout(() => {
                    setSuccess('');
                }, 5000);
            } else {
                setError(response?.message || 'Có lỗi xảy ra khi gửi đánh giá');
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            // Handle specific backend validation errors
            if (err?.response?.data?.message) {
                if (err.response.data.message.includes('30 characters')) {
                    setError('Nội dung đánh giá phải có ít nhất 30 ký tự');
                } else if (err.response.data.message.includes('INAPPROPRIATE_CONTENT')) {
                    setError('Nội dung đánh giá chứa từ ngữ không phù hợp');
                } else if (err.response.data.message.includes('LINK_IN_COMMENT')) {
                    setError('Nội dung đánh giá không được chứa liên kết');
                } else {
                    setError(err.response.data.message);
                }
            } else {
                setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="text-center py-4 text-gray-600">
                    <AlertCircle className="inline-block w-6 h-6 text-yellow-500 mb-2" />
                    <p>Vui lòng đăng nhập để đánh giá sản phẩm này</p>
                </div>
            </div>
        );
    }

    if (checkingEligibility) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex justify-center items-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!canReview) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="text-center py-4 text-gray-600">
                    <AlertCircle className="inline-block w-6 h-6 text-yellow-500 mb-2" />
                    <p>Bạn cần mua và nhận sản phẩm này trước khi đánh giá</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-xl font-semibold mb-4">Đánh giá của bạn</h2>

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {success}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <div>
                <div className="mb-4">
                    <div className="block mb-2 font-medium">Đánh giá sao</div>
                    <div className="flex">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;

                            return (
                                <div key={index} className="cursor-pointer" onClick={() => setRating(ratingValue)}>
                                    <FaStar
                                        className="w-8 h-8 mr-1"
                                        color={ratingValue <= (hover || rating) ? "#FBBF24" : "#e4e5e9"}
                                        size={24}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="block mb-2 font-medium">
                        Nội dung đánh giá (tối thiểu 30 ký tự)
                    </div>
                    <textarea
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này... (tối thiểu 30 ký tự)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <div className="text-sm text-gray-500 mt-1">
                        {content.length}/30 ký tự tối thiểu
                    </div>
                </div>

                <div
                    onClick={loading ? null : handleSubmit}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer inline-block ${loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? (
                        <>
                            <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 align-middle"></span>
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi đánh giá'
                    )}
                </div>
            </div>
        </div>
    );
};

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        pageSize: 5,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false
    });

    const fetchReviews = async (pageNo = 0) => {
        try {
            setLoading(true);
            setError(null);

            // Call the updated getReviews method with pagination options
            const response = await ProductService.getReviews(productId, {
                pageNo: pageNo,
                pageSize: 5 // Set to 5 reviews per page
            });

            if (response?.success && response?.data) {
                setReviews(response.data);
                // Update pagination state
                if (response.pagination) {
                    setPagination(response.pagination);
                    setCurrentPage(pageNo);
                }
            } else {
                // Handle case where no reviews are found
                setReviews([]);
                setPagination({
                    currentPage: 0,
                    totalPages: 0,
                    pageSize: 5,
                    totalElements: 0,
                    hasNext: false,
                    hasPrevious: false
                });
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Chưa có đánh giá nào cho sản phẩm này');
            setReviews([]);
            setPagination({
                currentPage: 0,
                totalPages: 0,
                pageSize: 5,
                totalElements: 0,
                hasNext: false,
                hasPrevious: false
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    // Pagination control functions
    const handlePreviousPage = () => {
        if (pagination.hasPrevious) {
            const prevPage = currentPage - 1;
            fetchReviews(prevPage);
        }
    };

    const handleNextPage = () => {
        if (pagination.hasNext) {
            const nextPage = currentPage + 1;
            fetchReviews(nextPage);
        }
    };

    // Toggle expand/collapse function
    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = {
        5: reviews.filter(review => review.rate === 5).length,
        4: reviews.filter(review => review.rate === 4).length,
        3: reviews.filter(review => review.rate === 3).length,
        2: reviews.filter(review => review.rate === 2).length,
        1: reviews.filter(review => review.rate === 1).length
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, index) => (
            <FaStar
                key={index}
                className={`inline ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            try {
                const response = await ProductService.deleteReview(reviewId);
                if (response?.success) {
                    fetchReviews(currentPage); // Refresh current page
                }
            } catch (err) {
                console.error('Error deleting review:', err);
                alert('Không thể xóa đánh giá. Vui lòng thử lại sau.');
            }
        }
    };

    return (
        <div className="space-y-4">
            <AddReview
                productId={productId}
                onReviewAdded={() => fetchReviews(0)} // Reset to first page when new review is added
            />

            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Collapsible Header */}
                <div
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                    onClick={toggleExpanded}
                >
                    <h2 className="text-xl font-semibold">
                        Đánh giá sản phẩm 
                    </h2>
                    <div className="flex items-center">
                        {!loading && reviews.length > 0 && (
                            <span className="text-sm text-gray-500 mr-2">
                                {averageRating} ⭐ • {pagination.totalElements} đánh giá
                            </span>
                        )}
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                    </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                    <div className="mt-4">
                        {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                        Chưa có đánh giá nào cho sản phẩm này
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row mb-6 border-b pb-6">
                            <div className="flex flex-col items-center justify-center md:w-1/3 mb-4 md:mb-0">
                                <div className="text-5xl font-bold text-gray-800">{averageRating}</div>
                                <div className="text-yellow-400 my-2">
                                    {renderStars(Math.round(averageRating))}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {reviews.length} đánh giá
                                </div>
                            </div>

                            <div className="md:w-2/3">
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className="flex items-center mb-2">
                                        <div className="w-12 text-sm text-right">
                                            {rating} <FaStar className="inline text-yellow-400" />
                                        </div>
                                        <div className="w-full mx-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400"
                                                style={{
                                                    width: `${reviews.length > 0 ? (ratingCounts[rating] / reviews.length) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="w-10 text-sm text-gray-500">
                                            {ratingCounts[rating]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Reviews Container */}
                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-6 pr-2" style={{scrollBehavior: 'smooth'}}>
                            {reviews.map(review => (
                                <div key={review.reviewId} className="border-b last:border-b-0 pb-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            {/* User Avatar */}
                                            <div className="flex-shrink-0">
                                                {review.avatarUser ? (
                                                    <img
                                                        src={review.avatarUser}
                                                        alt={review.customerName}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                        onError={(e) => {
                                                            // Fallback to default avatar if image fails to load
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxVjE5QzIwIDE3LjkzOTEgMTkuNTc4NiAxNi45MjE3IDE4LjgyODQgMTYuMTcxNkMxOC4wNzgzIDE1LjQyMTQgMTcuMDYwOSAxNSAxNiAxNUg4QzYuOTM5MTMgMTUgNS45MjE3MiAxNS40MjE0IDUuMTcxNTcgMTYuMTcxNkM0LjQyMTQzIDE2LjkyMTcgNCAxNy45MzkxIDQgMTlWMjEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTEyIDExQzE0LjIwOTEgMTEgMTYgOS4yMDkxNCAxNiA3QzE2IDQuNzkwODYgMTQuMjA5MSAzIDEyIDNDOS43OTA4NiAzIDggNC43OTA4NiA4IDdDOCA5LjIwOTE0IDkuNzkwODYgMTEgMTIgMTEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K';
                                                        }}
                                                    />
                                                ) : (
                                                    // Default avatar when no avatarUser is provided
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Username and Date */}
                                            <div className="flex flex-col">
                                                <h3 className="font-medium text-gray-900">{review.customerName}</h3>
                                                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                                            </div>
                                        </div>

                                        {/* Delete button for owner */}
                                        {review.isOwner && (
                                            <div
                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                className="text-sm text-red-500 hover:text-red-700 cursor-pointer flex-shrink-0"
                                            >
                                                Xóa
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-2 text-yellow-400">
                                        {renderStars(review.rate)}
                                    </div>
                                    {review.content && (
                                        <p className="text-gray-700">{review.content}</p>
                                    )}

                                    {review.comments && review.comments.length > 0 && (
                                        <div className="mt-3 pl-6 border-l-2 border-gray-100">
                                            {review.comments.map(comment => (
                                                <div key={comment.id} className="mt-2">
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-sm">{comment.author}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {formatDate(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-500">
                                    Trang {pagination.currentPage + 1} / {pagination.totalPages}
                                    ({pagination.totalElements} đánh giá)
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={!pagination.hasPrevious}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            pagination.hasPrevious
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!pagination.hasNext}
                                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            pagination.hasNext
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
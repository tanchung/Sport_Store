import React, { useState, useEffect, useRef } from "react";
import { message, Skeleton } from "antd";
import VoucherService from "@services/Voucher/VoucherService";
import UserService from "@services/User/UserService";
import { useAuth } from "@/context/AuthContext";
import CouponService from "@services/Coupon/CouponService";
import { GoGoal } from "react-icons/go"; 
import VoucherTest from "@/components/VoucherTest";
const PAGE_SIZE = 10;

const Voucher = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableVouchersLoading, setAvailableVouchersLoading] = useState(false);
  const [userVouchersLoading, setUserVouchersLoading] = useState(false);
  const [exchangeableVouchers, setExchangeableVouchers] = useState([]);
  const [userVouchers, setUserVouchers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const { currentUser } = useAuth();
  
  // Debug: Log currentUser structure
  useEffect(() => {
    console.log('Current user data:', currentUser);
    console.log('Current user data structure:', {
      currentUser,
      id: currentUser?.data?.id,
      userId: currentUser?.data?.userId,
      directId: currentUser?.id,
      directUserId: currentUser?.userId
    });
  }, [currentUser]);

  // Get userId from multiple possible locations
  const getUserId = () => {
    const userId = currentUser?.data?.id || 
                   currentUser?.data?.userId || 
                   currentUser?.id || 
                   currentUser?.userId;
    
    console.log('Extracted userId:', userId);
    return userId;
  };

  const userId = getUserId();
  const listRef = useRef();

  // Fetch user points
  const fetchUserPoints = async () => {
    try {
      console.log('Fetching user points...');
      const userInfo = await UserService.getCurrentUserInfo();
      console.log('User info response:', userInfo);
      
      if (userInfo.success && userInfo.data) {
        const points = userInfo.data.pointVoucher || 0;
        console.log('Setting user points:', points);
        setUserPoints(points);
        setDebugInfo(prev => ({ ...prev, userPoints: points, userInfo: userInfo.data }));
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
      message.error("Không thể tải thông tin điểm tích lũy!");
    }
  };

  // Fetch available vouchers (all vouchers that can be redeemed)
  const fetchAvailableVouchers = async () => {
    setAvailableVouchersLoading(true);
    try {
      console.log('Fetching available vouchers...');
      const result = await VoucherService.getVouchers(1, 100); // Get all available vouchers
      console.log('Available vouchers result:', result);
      setExchangeableVouchers(result.items || []);
      setDebugInfo(prev => ({ ...prev, availableVouchers: result.items?.length || 0 }));
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
      message.error("Không thể tải danh sách voucher có thể đổi!");
    } finally {
      setAvailableVouchersLoading(false);
    }
  };

  // Fetch user's vouchers (vouchers owned by current user)
  const fetchUserVouchers = async (pageNum = 1) => {
    if (!userId) {
      console.warn('No userId available for fetching user vouchers. Current user:', currentUser);
      message.warning("Không thể xác định người dùng. Vui lòng đăng nhập lại!");
      return;
    }

    setUserVouchersLoading(true);
    try {
      console.log('Fetching user vouchers for userId:', userId);
      const userVouchersList = await VoucherService.getUserVouchers(userId);
      console.log('User vouchers response:', userVouchersList);

      if (pageNum === 1) {
        setUserVouchers(userVouchersList || []);
      } else {
        setUserVouchers((prev) => [...prev, ...(userVouchersList || [])]);
      }

      setDebugInfo(prev => ({ ...prev, userVouchers: userVouchersList?.length || 0 }));

      // For simplicity, assume no pagination for user vouchers from this endpoint
      setHasNext(false);
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
      message.error("Không thể tải danh sách voucher của bạn!");
    } finally {
      setUserVouchersLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('Voucher page useEffect triggered. userId:', userId);
      
      if (!userId) {
        console.warn('No userId available, skipping data fetch');
        return;
      }

      // Fetch user points
      await fetchUserPoints();

      // Fetch both sections simultaneously
      await Promise.all([
        fetchAvailableVouchers(),
        fetchUserVouchers(page)
      ]);
    };

    fetchData();
  }, [userId, page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasNext && !loadingMore) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleAddVoucherToUser = async (voucher) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm voucher!");
      return;
    }

    // Check if user has enough points
    if (userPoints < (voucher.pointsRequired || 0)) {
      message.error(`Bạn cần ${voucher.pointsRequired || 0} điểm để đổi voucher này. Hiện tại bạn có ${userPoints} điểm.`);
      return;
    }

    setLoading(true);
    try {
      console.log('Adding voucher to user:', { userId, voucherId: voucher.id, voucher });
      // Use the addVoucherToUser endpoint from backend
      const response = await VoucherService.addVoucherToUser(userId, voucher.id);
      console.log('Add voucher response:', response);
      
      if (response.success) {
        message.success("Thêm voucher thành công!");
        // Refresh user vouchers list and points
        await Promise.all([
          fetchUserVouchers(1),
          fetchUserPoints()
        ]);
        setPage(1); // Reset pagination
      } else {
        message.error(response.message || "Thêm voucher thất bại!");
      }
    } catch (error) {
      console.error('Error adding voucher to user:', error);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
  
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Voucher Của Bạn</h1>
        <p className="text-gray-600">Đổi điểm tích lũy để nhận ưu đãi hấp dẫn</p>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 mb-10 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Hệ thống quản lý voucher</p>
            <h2 className="text-2xl font-bold">Voucher của {currentUser?.data?.name || currentUser?.name || 'bạn'}</h2>
            <p className="text-sm opacity-80 mt-1">Quản lý và sử dụng voucher một cách hiệu quả</p>
            <div className="mt-3 flex items-center">
              <GoGoal className="h-5 w-5 mr-2" />
              <span className="text-lg font-semibold">Điểm tích lũy: {userPoints.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <GoGoal className="h-10 w-10" />
          </div>
        </div>
      </div>

      {/* Voucher Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Vouchers */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Voucher Có Thể Đổi
            </h3>
          </div>

          <div className="p-6 h-[500px] overflow-y-auto">
            {availableVouchersLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : exchangeableVouchers.length > 0 ? (
              <div className="space-y-4">
                {exchangeableVouchers.map((v) => (
                  <div key={v.id || v.code} className="relative border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

                    <div className="p-5 pl-7">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{v.code}</h4>
                          <p className="text-sm text-gray-500">
                            Giảm {v.discount || v.discountAmount}{v.isPercentage ? "%" : "₫"}
                            {v.minOrderAmount && ` đơn từ ${v.minOrderAmount?.toLocaleString()}₫`}
                          </p>
                          {v.pointsRequired && (
                            <p className="text-xs text-blue-600 mt-1">
                              Cần {v.pointsRequired} điểm để đổi
                              {userPoints >= v.pointsRequired ? (
                                <span className="text-green-600 ml-1">✓ Đủ điểm</span>
                              ) : (
                                <span className="text-red-600 ml-1">✗ Thiếu {v.pointsRequired - userPoints} điểm</span>
                              )}
                            </p>
                          )}
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          Có sẵn
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <p>HSD: {v.endDate}</p>
                          {v.maxDiscountAmount && <p>Giảm tối đa: {v.maxDiscountAmount?.toLocaleString()}₫</p>}
                          <p>Trạng thái: {v.active ? 'Hoạt động' : 'Không hoạt động'}</p>
                        </div>

                        <button
                          onClick={() => handleAddVoucherToUser(v)}
                          disabled={loading || !v.active || (v.pointsRequired && userPoints < v.pointsRequired)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm ${
                            v.active && (!v.pointsRequired || userPoints >= v.pointsRequired)
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          } transition-colors`}
                        >
                          {loading ? 'Đang xử lý...' : 
                           v.pointsRequired && userPoints < v.pointsRequired ? 'Không đủ điểm' : 'Thêm vào ví'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                <p>Hiện không có voucher nào có sẵn</p>
              </div>
            )}
          </div>
        </div>

        {/* User's Vouchers */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-green-100 px-6 py-4 border-b border-green-200">
            <h3 className="text-xl font-semibold text-green-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Voucher Của Tôi
            </h3>
          </div>

          <div
            className="p-6 h-[500px] overflow-y-auto"
            onScroll={handleScroll}
            ref={listRef}
          >
            {userVouchersLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : userVouchers.length > 0 ? (
              <div className="space-y-4">
                {userVouchers.map((v, idx) => (
                  <div key={v.id || v.code || idx} className="relative border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>

                    <div className="p-5 pl-7">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">{v.code}</h4>
                          <p className="text-sm text-gray-500">
                            Giảm {v.discountAmount || v.discount}{v.percentTage ? "%" : "₫"}
                            {v.minOrderAmount && ` đơn từ ${v.minOrderAmount?.toLocaleString()}₫`}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Sở hữu
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          <p>HSD: {v.endDate}</p>
                          {v.maxDiscountAmount && <p>Giảm tối đa: {v.maxDiscountAmount?.toLocaleString()}₫</p>}
                          <p>Trạng thái: {v.active ? 'Hoạt động' : 'Không hoạt động'}</p>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>Bắt đầu: {v.startDate}</p>
                          {v.usageLimit && <p>Giới hạn: {v.usedCount || 0}/{v.usageLimit}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {hasNext && (
                  <div className="flex justify-center py-4">
                    <button
                      onClick={() => {
                        setLoadingMore(true);
                        setPage(prev => prev + 1);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 012-2h.5a2 2 0 011.983 1.738l3.11-1.382A1 1 0 0121 5.582v12.836a1 1 0 01-1.407.914l-3.11-1.382A2 2 0 0114.5 18H12a2 2 0 01-2-2z" />
                </svg>
                <p>Bạn chưa có voucher nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voucher;
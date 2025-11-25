import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TawkToService from '../services/TawkTo/TawkToService';

/**
 * Hook để sử dụng Tawk.to chat widget
 * Tự động sync với user authentication state
 */
export const useTawkTo = () => {
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    // Khởi tạo hoặc cập nhật Tawk.to khi user state thay đổi
    if (isAuthenticated && currentUser) {
      TawkToService.updateUser(currentUser);
    } else {
      TawkToService.initialize(null);
    }
  }, [currentUser, isAuthenticated]);

  return {
    show: () => TawkToService.show(),
    hide: () => TawkToService.hide(),
    maximize: () => TawkToService.maximize(),
    minimize: () => TawkToService.minimize(),
    on: (event, callback) => TawkToService.on(event, callback),
  };
};

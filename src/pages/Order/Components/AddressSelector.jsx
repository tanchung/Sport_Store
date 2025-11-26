import React from 'react';
import { FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

const AddressSelector = ({ addresses, selectedAddress, onSelectAddress, onAddNew }) => {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
        <button
          onClick={onAddNew}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm địa chỉ mới
        </button>
      </div>
    );
  }

  const formatAddress = (address) => {
    const parts = [
      address.addressLine,
      address.wardCommune,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Chọn địa chỉ giao hàng</h3>
        <button
          onClick={onAddNew}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => (
          <motion.div
            key={address.id}
            whileHover={{ scale: 1.01 }}
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
              selectedAddress?.id === address.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelectAddress(address)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FaMapMarkerAlt
                  className={`text-xl mt-1 ${
                    selectedAddress?.id === address.id ? 'text-blue-500' : 'text-gray-400'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{formatAddress(address)}</p>
                  {address.postalCode && (
                    <p className="text-sm text-gray-500 mt-1">Mã bưu chính: {address.postalCode}</p>
                  )}
                </div>
              </div>
              {selectedAddress?.id === address.id && (
                <div className="ml-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCheck className="text-white text-xs" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AddressSelector;

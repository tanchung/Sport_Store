import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { message } from 'antd';

const AddressForm = ({ userId, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    addressLine: '',
    wardCommune: '',
    state: '',
    postalCode: '',
    country: 'Việt Nam',
    userId: userId
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.wardCommune.trim()) {
      newErrors.wardCommune = 'Vui lòng nhập phường/xã';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'Vui lòng nhập tỉnh/thành phố';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Vui lòng nhập quốc gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Thêm địa chỉ mới</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="addressLine"
            value={formData.addressLine}
            onChange={handleInputChange}
            className={`w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 ${
              errors.addressLine
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Số nhà, tên đường"
          />
          {errors.addressLine && (
            <p className="text-red-500 text-sm mt-1">{errors.addressLine}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phường/Xã <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="wardCommune"
              value={formData.wardCommune}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 ${
                errors.wardCommune
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="Phường/Xã"
            />
            {errors.wardCommune && (
              <p className="text-red-500 text-sm mt-1">{errors.wardCommune}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 ${
                errors.state
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="Tỉnh/Thành phố"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã bưu chính
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Mã bưu chính"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quốc gia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 ${
                errors.country
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="Quốc gia"
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddressForm;

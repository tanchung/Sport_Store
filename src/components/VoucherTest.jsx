import React, { useState } from 'react';
import VoucherService from '@services/Voucher/VoucherService';
import UserService from '@services/User/UserService';
import { message } from 'antd';

const VoucherTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testGetAllVouchers = async () => {
    setLoading(true);
    try {
      const result = await VoucherService.getVouchers(1, 10);
      setTestResults(prev => ({ ...prev, getAllVouchers: result }));
      message.success('Test getAllVouchers thành công!');
    } catch (error) {
      setTestResults(prev => ({ ...prev, getAllVouchers: { error: error.message } }));
      message.error('Test getAllVouchers thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setLoading(true);
    try {
      const result = await UserService.getCurrentUserInfo();
      setTestResults(prev => ({ ...prev, getCurrentUser: result }));
      message.success('Test getCurrentUser thành công!');
    } catch (error) {
      setTestResults(prev => ({ ...prev, getCurrentUser: { error: error.message } }));
      message.error('Test getCurrentUser thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetUserVouchers = async (userId) => {
    if (!userId) {
      message.warning('Vui lòng nhập User ID');
      return;
    }
    
    setLoading(true);
    try {
      const result = await VoucherService.getUserVouchers(userId);
      setTestResults(prev => ({ ...prev, getUserVouchers: result }));
      message.success('Test getUserVouchers thành công!');
    } catch (error) {
      setTestResults(prev => ({ ...prev, getUserVouchers: { error: error.message } }));
      message.error('Test getUserVouchers thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Voucher API Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={testGetAllVouchers}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test GetAllVouchers
        </button>
        
        <button
          onClick={testGetCurrentUser}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test GetCurrentUser
        </button>
        
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="User ID"
            id="testUserId"
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={() => testGetUserVouchers(document.getElementById('testUserId').value)}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Test GetUserVouchers
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Test Results:</h4>
        <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default VoucherTest;

import React from 'react';
import Pagination from './Pagination';

const PaginationTest = () => {
  // Test data with multiple pages
  const testPaginationData = {
    currentPage: 2,
    totalPages: 10,
    totalItems: 120,
    itemsPerPage: 12,
    hasPrevious: true,
    hasNext: true,
    loading: false
  };

  const handlePageChange = (page) => {
    console.log('🧪 Test Page Change:', page);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">🧪 Pagination Component Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-semibold mb-4">Test Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{JSON.stringify(testPaginationData, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Pagination Component:</h2>
          
          <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg">
            <Pagination
              currentPage={testPaginationData.currentPage}
              totalPages={testPaginationData.totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={testPaginationData.itemsPerPage}
              totalItems={testPaginationData.totalItems}
              hasPrevious={testPaginationData.hasPrevious}
              hasNext={testPaginationData.hasNext}
              loading={testPaginationData.loading}
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>✅ Nếu bạn thấy các nút số trang ở trên, component hoạt động bình thường</p>
            <p>❌ Nếu không thấy gì, có vấn đề với component Pagination</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <h2 className="text-lg font-semibold mb-4">Test Cases:</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. Single Page (Should be hidden):</h3>
              <div className="border border-gray-300 p-4 rounded">
                <Pagination
                  currentPage={1}
                  totalPages={1}
                  onPageChange={handlePageChange}
                  itemsPerPage={12}
                  totalItems={5}
                  hasPrevious={false}
                  hasNext={false}
                  loading={false}
                />
                <p className="text-sm text-gray-500 mt-2">Should show nothing (totalPages ≤ 1)</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. First Page:</h3>
              <div className="border border-gray-300 p-4 rounded">
                <Pagination
                  currentPage={1}
                  totalPages={5}
                  onPageChange={handlePageChange}
                  itemsPerPage={12}
                  totalItems={60}
                  hasPrevious={false}
                  hasNext={true}
                  loading={false}
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. Last Page:</h3>
              <div className="border border-gray-300 p-4 rounded">
                <Pagination
                  currentPage={5}
                  totalPages={5}
                  onPageChange={handlePageChange}
                  itemsPerPage={12}
                  totalItems={60}
                  hasPrevious={true}
                  hasNext={false}
                  loading={false}
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. Loading State:</h3>
              <div className="border border-gray-300 p-4 rounded">
                <Pagination
                  currentPage={3}
                  totalPages={10}
                  onPageChange={handlePageChange}
                  itemsPerPage={12}
                  totalItems={120}
                  hasPrevious={true}
                  hasNext={true}
                  loading={true}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-8">
          <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Mở Developer Tools (F12)</li>
            <li>2. Vào tab Console</li>
            <li>3. Click vào các nút pagination để test</li>
            <li>4. Kiểm tra console logs</li>
            <li>5. Nếu không thấy nút nào, có vấn đề với CSS hoặc component</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PaginationTest;

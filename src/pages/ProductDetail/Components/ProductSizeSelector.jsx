import React from 'react';

const ProductSizeSelector = ({ sizes = [], selectedSizeId, onChange }) => {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Kích thước:</div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((ps) => (
          <button
            key={ps.id}
            onClick={() => onChange(ps.id)}
            className={`px-3 py-1 rounded border text-sm ${
              selectedSizeId === ps.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {ps.sizeName || ps.size?.sizeName || ps.size?.size || ps.size?.name || ps.size || ps.label || ps.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSizeSelector;


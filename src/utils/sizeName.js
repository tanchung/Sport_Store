// Utility to enrich cart/order items with human-readable size names
// Given backend returns productSizeId and sizeName is numeric in some DTOs,
// we fetch the ProductSize detail to resolve a displayable label.

import ProductSizeService from '@services/ProductSize/ProductSizeService'

export async function resolveSizeNameForItems(items = []) {
  const results = []
  for (const item of items) {
    let sizeName = item.sizeName
    const psId = item.sizeId || item.productSizeId
    try {
      if (!sizeName && psId) {
        const ps = await ProductSizeService.getById(psId)
        sizeName = ps.sizeName
      }
    } catch (e) {
      // ignore and fallback
    }
    results.push({ ...item, sizeName, sizeId: psId })
  }
  return results
}


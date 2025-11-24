// Google Analytics Service
// Advanced tracking for e-commerce events

class GoogleAnalyticsService {
  // Check if GA is loaded
  static isGALoaded() {
    return typeof window.gtag !== 'undefined';
  }

  // Track page views
  static trackPageView(page_path, page_title) {
    if (this.isGALoaded()) {
      window.gtag('event', 'page_view', {
        page_path: page_path,
        page_title: page_title,
        page_location: window.location.href
      });
    }
  }

  // Track product views
  static trackProductView(product) {
    if (this.isGALoaded() && product) {
      window.gtag('event', 'view_item', {
        currency: 'VND',
        value: product.price || 0,
        items: [{
          item_id: product.id || product.sku,
          item_name: product.name,
          item_brand: product.brand?.name || product.brand,
          item_category: product.category,
          price: product.price || 0,
          quantity: 1
        }]
      });
    }
  }

  // Track add to cart
  static trackAddToCart(product, quantity = 1) {
    if (this.isGALoaded() && product) {
      window.gtag('event', 'add_to_cart', {
        currency: 'VND',
        value: (product.price || 0) * quantity,
        items: [{
          item_id: product.id || product.sku,
          item_name: product.name,
          item_brand: product.brand?.name || product.brand,
          item_category: product.category,
          price: product.price || 0,
          quantity: quantity
        }]
      });
    }
  }

  // Track remove from cart
  static trackRemoveFromCart(product, quantity = 1) {
    if (this.isGALoaded() && product) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'VND',
        value: (product.price || 0) * quantity,
        items: [{
          item_id: product.id || product.sku,
          item_name: product.name,
          item_brand: product.brand?.name || product.brand,
          item_category: product.category,
          price: product.price || 0,
          quantity: quantity
        }]
      });
    }
  }

  // Track begin checkout
  static trackBeginCheckout(cartItems, totalValue) {
    if (this.isGALoaded() && cartItems) {
      const items = cartItems.map(item => ({
        item_id: item.product?.id || item.product?.sku,
        item_name: item.product?.name,
        item_brand: item.product?.brand?.name || item.product?.brand,
        item_category: item.product?.category,
        price: item.product?.price || 0,
        quantity: item.quantity || 1
      }));

      window.gtag('event', 'begin_checkout', {
        currency: 'VND',
        value: totalValue,
        items: items
      });
    }
  }

  // Track purchase/order completion
  static trackPurchase(orderId, cartItems, totalValue, shipping = 0, tax = 0) {
    if (this.isGALoaded() && cartItems) {
      const items = cartItems.map(item => ({
        item_id: item.product?.id || item.product?.sku,
        item_name: item.product?.name,
        item_brand: item.product?.brand?.name || item.product?.brand,
        item_category: item.product?.category,
        price: item.product?.price || 0,
        quantity: item.quantity || 1
      }));

      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: 'VND',
        value: totalValue,
        shipping: shipping,
        tax: tax,
        items: items
      });
    }
  }

  // Track search
  static trackSearch(searchTerm) {
    if (this.isGALoaded() && searchTerm) {
      window.gtag('event', 'search', {
        search_term: searchTerm
      });
    }
  }

  // Track product list view
  static trackViewItemList(products, listName = 'Products') {
    if (this.isGALoaded() && products && products.length > 0) {
      const items = products.map((product, index) => ({
        item_id: product.id || product.sku,
        item_name: product.name,
        item_brand: product.brand?.name || product.brand,
        item_category: product.category,
        price: product.price || 0,
        index: index
      }));

      window.gtag('event', 'view_item_list', {
        item_list_name: listName,
        items: items.slice(0, 20) // GA4 limits to 200 items, but we'll send 20 for performance
      });
    }
  }

  // Track product click from list
  static trackSelectItem(product, listName = 'Products', index = 0) {
    if (this.isGALoaded() && product) {
      window.gtag('event', 'select_item', {
        item_list_name: listName,
        items: [{
          item_id: product.id || product.sku,
          item_name: product.name,
          item_brand: product.brand?.name || product.brand,
          item_category: product.category,
          price: product.price || 0,
          index: index
        }]
      });
    }
  }

  // Track user registration
  static trackSignUp(method = 'email') {
    if (this.isGALoaded()) {
      window.gtag('event', 'sign_up', {
        method: method
      });
    }
  }

  // Track user login
  static trackLogin(method = 'email') {
    if (this.isGALoaded()) {
      window.gtag('event', 'login', {
        method: method
      });
    }
  }

  // Track custom events
  static trackCustomEvent(eventName, eventParams = {}) {
    if (this.isGALoaded()) {
      window.gtag('event', eventName, eventParams);
    }
  }

  // Track exceptions/errors
  static trackException(description, fatal = false) {
    if (this.isGALoaded()) {
      window.gtag('event', 'exception', {
        description: description,
        fatal: fatal
      });
    }
  }

  // Set user ID (when user logs in)
  static setUserId(userId) {
    if (this.isGALoaded() && userId) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        'user_id': userId
      });
    }
  }

  // Set user properties
  static setUserProperties(properties) {
    if (this.isGALoaded() && properties) {
      window.gtag('set', 'user_properties', properties);
    }
  }
}

export default GoogleAnalyticsService;

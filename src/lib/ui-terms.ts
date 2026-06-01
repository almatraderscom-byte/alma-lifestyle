/**
 * Standard ecommerce English terms — common on Daraz, Facebook Shop, bKash, etc.
 * Use for buttons, labels, and navigation across the customer storefront.
 */
export const UI = {
  // Actions
  addToCart: 'Add to Cart',
  addToWishlist: 'Add to Wishlist',
  removeFromWishlist: 'Remove from Wishlist',
  buyNow: 'Buy Now',
  quickView: 'Quick View',
  checkout: 'Checkout',
  proceedToCheckout: 'Proceed to Checkout',
  placeOrder: 'Place Order',
  continueShopping: 'Continue Shopping',
  apply: 'Apply',
  reset: 'Reset',
  remove: 'Remove',
  submit: 'Submit',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  update: 'Update',
  close: 'Close',

  // Navigation
  search: 'Search',
  cart: 'Cart',
  myCart: 'Your Cart',
  wishlist: 'Wishlist',
  shop: 'Shop',
  myAccount: 'My Account',
  home: 'Home',

  // Auth
  login: 'Login',
  signUp: 'Sign Up',
  logout: 'Logout',
  forgotPassword: 'Forgot Password?',
  password: 'Password',
  email: 'Email',
  phone: 'Phone',
  phoneNumber: 'Phone Number',
  mobile: 'Mobile',
  fullName: 'Full Name',
  name: 'Name',

  // Product
  size: 'Size',
  color: 'Color',
  quantity: 'Quantity',
  qty: 'Qty',
  reviews: 'Reviews',
  inStock: 'In Stock',
  outOfStock: 'Out of Stock',
  newBadge: 'NEW',
  saleBadge: 'SALE',
  popular: 'Popular',

  // Cart & checkout
  subtotal: 'Subtotal',
  delivery: 'Delivery',
  total: 'Total',
  emptyCart: 'Your cart is empty',
  orderNotes: 'Order Notes',
  address: 'Address',
  city: 'City',
  paymentMethod: 'Payment Method',
  cashOnDelivery: 'Cash on Delivery',

  // Order
  order: 'Order',
  orderNumber: 'Order Number',
  orderId: 'Order ID',
  orderSummary: 'Order Summary',
  orderStatus: 'Order Status',
  trackOrder: 'Track Order',
  trackOnWhatsApp: 'Track Order on WhatsApp',

  // Status
  loading: 'Loading…',
  saving: 'Saving…',
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',

  // Filters (PLP)
  filter: 'Filter',
  sort: 'Sort',
  all: 'All',

  // Common
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  followUs: 'Follow Us',
  newsletter: 'Newsletter',
  contact: 'Contact',
} as const;

export type UiTermKey = keyof typeof UI;

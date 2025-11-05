export const QUERY_KEYS = {
  VENDORS: {
    ALL_VENDORSS: "allVendors",
    GET_VENDOR_BY_ID: "getVendorById"
    
  },
  SEARCH:{
    FULL_TEXT_SEARCH:"fullTextSearch"
  },
  USER: {
    GET_ADDRESSES: "getAddresses",
    CREATE_ADDRESS: "createAddress",
    GET_VENDOR_ONBOARDING_TRACK:"getVendorOnboardingTrack"
  },
  CART:{
    ADD_CART_ITEM:"addCartItem",
    GET_CART_ITEMS:"getCartItems",
    DELETE_CART_ITEM:"deleteCartItem",
    ADJUST_CART_ITEM_QUANTITY:"adjustCartItemQuantity",
    GET_CART_TOTALS:"getCartTotals"
  },
  ORDER:{
    CREATE_ORDER:"createOrder",
    GET_ORDER_BY_ID:"getOrderById",
    GET_USER_ORDERS:"getUserOrders",
  },
  PAYMENT:{
    INITIATE_PAYMENT:"initiatePayment"
  }

} as const satisfies Record<Uppercase<string>, object>;
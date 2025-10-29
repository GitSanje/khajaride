export const QUERY_KEYS = {
  VENDORS: {
    ALL_VENDORSS: "allVendors",
    GET_VENDOR_BY_ID: "getVendorById"
    
  },
  SEARCH:{
    FULL_TEXT_SEARCH:"fullTextSearch"
  },
  CART:{
    ADD_CART_ITEM:"addCartItem",
    GET_CART_ITEMS:"getCartItems"
  },
  ORDER:{
    CREATE_ORDER:"createOrder"
  },
  PAYMENT:{
    INITIATE_PAYMENT:"initiatePayment"
  }

} as const satisfies Record<Uppercase<string>, object>;
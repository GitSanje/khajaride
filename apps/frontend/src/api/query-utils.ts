export const QUERY_KEYS = {
  VENDORS: {
    ALL_VENDORSS: "allVendors",
    GET_VENDOR_BY_ID: "getVendorById"
    
  },

} as const satisfies Record<Uppercase<string>, object>;
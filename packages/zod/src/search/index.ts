import { z } from "zod";

export const ZInsertDocPayloadSchema = z.object({
  index_name: z.string().nonempty("index_name is required"),
  doc: z.record(z.any()).refine((val) => val !== null, {
    message: "doc is required",
  }),
});


export const ZSearchParamsPayloadSchema = z.object({
  query: z
    .string({
      required_error: "query is required",
    })
    .min(1, "query cannot be empty"),

  page_size: z
    .number()
    .int()
    .positive()
    .default(20)
    .describe("Number of results per page"),

  last_sort: z
    .array(z.any())
    .optional()
    .describe("Used for deep pagination (Elasticsearch search_after)"),

  is_vegetarian: z
    .boolean()
    .optional()
    .nullable()
    .describe("Filter for vegetarian menus"),

  city: z
    .string()
    .optional()
    .describe("Filter by vendor city"),
  user_latitude : z.number().optional().nullable(),
  user_longitude : z.number().optional().nullable(),
  radius_meters: z.number().optional().nullable()

});


// --------------------- Category Schema ---------------------
export const ZCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

// --------------------- Vendor Location Schema ---------------------
export const ZVendorLocationSchema = z.object({
  lat: z.number(),
  lon: z.number(),
});

// --------------------- Vendor Schema ---------------------
export const ZVendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  cuisine: z.string(),
  cuisine_tags: z.string(),
  vendor_type: z.string(),
  rating: z.number(),
  favorite_count: z.number(),
  is_open: z.boolean(),
  is_featured: z.boolean(),
  delivery_available: z.boolean(),
  pickup_available: z.boolean(),
  delivery_fee: z.number(),
  min_order_amount: z.number(),
  promo_text: z.string(),
  vendor_notice: z.string(),
  location: ZVendorLocationSchema,
  street_address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  opening_hours: z.string(),               
  vendor_listing_image_name: z.string(),    
  vendor_logo_image_name: z.string(),       
});

// --------------------- Menu Item Schema ---------------------
export const ZElasticsearchMenuItemSchema = z.object({
  menu_id: z.string(),
  menu_name: z.string(),
  menu_description: z.string(),
  tags: z.string(),
  keywords: z.string(),
  base_price: z.number(),
  is_available: z.boolean(),
  is_popular: z.boolean(),
  is_vegetarian: z.boolean().optional().default(false),
  is_vegan: z.boolean().optional().default(false),
  is_gluten_free: z.boolean().optional().default(false),
  spicy_level: z.number().optional().default(0),
  portion_size: z.string().optional().default(""),
  category: ZCategorySchema,
  vendor: ZVendorSchema,
  sort: z.array(z.number()).optional(),
});

// --------------------- Search Response Schema ---------------------
export const ZSearchResponseSchema = z.object({
  results: z.array(ZElasticsearchMenuItemSchema),
  total: z.number(),
  took: z.number(),
  last_sort: z.array(z.number()).optional(),
});

export type TVendorSearchRes = z.infer<typeof ZVendorSchema>;
export type TVendorMenuSearchRes = z.infer<typeof ZElasticsearchMenuItemSchema>;
export type InsertDocPayload = z.infer<typeof ZInsertDocPayloadSchema>;

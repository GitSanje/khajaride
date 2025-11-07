

import { z } from "zod";
import { initContract } from "@ts-rest/core"; 
import {
  ZCreateVendorPayload,
  ZVendor,
  ZUpdateVendorPayload,
  ZDeleteVendorPayload,
  ZGetVendorsQuery,
  ZVendorPopulated,
  schemaWithPagination,
  ZVendorAddress,
  ZVendorWithAddress
} from "@khajaride/zod";
import { getSecurityMetadata } from "../utils.js";

const c = initContract();
const metadata = getSecurityMetadata();


export const vendorContract = c.router({
  // Create vendor
  createVendor: {
    path: "/vendors",
    method: "POST",
    body: ZCreateVendorPayload,
    responses: { 201: ZVendor },
    summary: "Create a new vendor",
    description: "Add vendor to database",
    metadata,
  },

   // Create vendor address
  createVendorAddress: {
    path: "/vendors/addresses",
    method: "POST",
    body: ZVendorAddress,
    responses: { 201: ZVendorAddress },
    summary: "Create a new vendor address",
    description: "Add vendor address to database",
    metadata,
  },

  // Update vendor
  updateVendor: {
    path: "/vendors/:id",
    method: "PATCH",
    body: ZUpdateVendorPayload,
    responses: { 200: ZVendor },
    summary: "Update vendor by ID",
  metadata,
  },

  // Delete vendor
  deleteVendor: {
    path: "/vendors/:id",
    method: "DELETE",
    body: ZDeleteVendorPayload,
    responses: { 204: z.undefined() },
    summary: "Delete vendor by ID",
   metadata,
  },

  // Get vendor by ID
  getVendorByID: {
    path: "/vendors/:id",
    method: "GET",
    query: z.undefined(),
    responses: { 200: ZVendorPopulated },
    summary: "Get vendor details by ID",
    metadata,
  },

  // Get list of vendors with pagination/filter
  getVendors: {
    path: "/vendors",
    method: "GET",
    query: ZGetVendorsQuery,
    responses:{
      200 : schemaWithPagination(ZVendor)
    },
    summary: "Get list of vendors with pagination/filter",
  metadata,
  },
  getVendorByUserId: {
    path: "/vendors/vendorByUserId",
    method: "GET",
    responses:{
      200 : ZVendorWithAddress
    },
    summary: "Get  vendor by vendor user id",
  metadata,
  },

  uploadImages: {
      summary: "Upload images",
      path: "/vendors/upload-images",
      method: "POST",
      contentType: "multipart/form-data",
      body: z.object({
        file: z.object({
          type: z.literal("file"),
        }),
      }),
      responses: {
        201: z.object({
          uploadedURLs: z.array(z.string())
        }),
      },
      metadata: metadata,
    },
},{
    pathPrefix: "/v1",
  });
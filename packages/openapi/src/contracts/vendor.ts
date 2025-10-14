

import { z } from "zod";
import { initContract } from "@ts-rest/core"; 
import {
  ZCreateVendorPayload,
  ZVendor,
  ZUpdateVendorPayload,
  ZDeleteVendorPayload,
  ZGetVendorsQuery,
  ZVendorPopulated,
  schemaWithPagination
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
},{
    pathPrefix: "/v1",
  });
import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";

import {
  ZInsertDocPayloadSchema,
  ZSearchParamsPayloadSchema,
  ZSearchResponseSchema
} from "@khajaride/zod";


const c = initContract();
const metadata = getSecurityMetadata();


// ----------- DOCUMENT INSERT CONTRACT -----------
export const searchContract = c.router({
  insertDocument: {
    summary: "Insert a single document into an Elasticsearch index",
    path: "/search/doc-insert",
    method: "POST",
    description: "Insert a single document into the specified Elasticsearch index",
    body: ZInsertDocPayloadSchema,
    responses: {
      201: z.object({
        message: z.string(),
      }),
    },
    metadata,
  },

  fullTextSearch: {
      summary: "Perform a full-text search on vendor_menu index",
      path: "/search/full-text",
      method: "POST",
      description:
        "Performs a multi-field full-text search with optional filters and deep pagination",
      body: ZSearchParamsPayloadSchema,
      responses: {
        200: ZSearchResponseSchema
      },
      metadata,
    },
  
},{
    pathPrefix: "/v1",
  });
import { z } from "zod";
import { initContract } from "@ts-rest/core";
import { getSecurityMetadata } from "../utils.js";

import {
  ZInsertDocPayloadSchema
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
},{
    pathPrefix: "/v1",
  });
import { extendZodWithOpenApi } from "@anatine/zod-openapi";
import { z } from "zod";

// extendZodWithOpenApi(z);

export * from "./utils.js";
export * from "./health.js";
export * from "./user/index.js";
export * from "./vendor/index.js";
export * from "./search/index.js";
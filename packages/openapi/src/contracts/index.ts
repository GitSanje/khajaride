import { initContract } from "@ts-rest/core";
import { healthContract } from "./health.js";
import { userContract } from "./user.js";
import { vendorContract } from "./vendor.js";
import { searchContract } from "./search.js";

const c = initContract();

export const apiContract = c.router({
  Health: healthContract,
  User: userContract,
  Vendor: vendorContract,
  Search: searchContract
});

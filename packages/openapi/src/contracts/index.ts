import { initContract } from "@ts-rest/core";
import { healthContract } from "./health.js";
import { userContract } from "./user.js";
import { vendorContract } from "./vendor.js";
import { searchContract } from "./search.js";
import { cartContract } from "./cart.js";
import { orderContract } from "./order.js";
import { paymentContract } from "./payment.js";

const c = initContract();

export const apiContract = c.router({
  Health: healthContract,
  User: userContract,
  Vendor: vendorContract,
  Search: searchContract,
  Cart: cartContract,
  Order : orderContract,
  Payment: paymentContract
});

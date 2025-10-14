import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";



// Type definitions for VENDOR operations

export type TGetVendorsQuery = TRequests["Vendor"]["getVendors"]["query"];

export type TGetVendorsByIDResponse = ServerInferResponseBody<
  typeof apiContract.Vendor.getVendorByID,
  200
>;

export type TGetVendorsResponse = ServerInferResponseBody<
  typeof apiContract.Vendor.getVendors,
  200
>;


const fetchAllVendors = async ({
  api,
  query,
}: {
  api: TApiClient;
  query?: TGetVendorsQuery;
}): Promise<TGetVendorsResponse> => {

  try {
    const res = await api.Vendor.getVendors({ query });

    // Check if the API returned successfully
    if (res.status === 200) {
      return res.body; // ✅ return the response data
    } else {
      throw res.body; // ❌ throw to be caught by React Query
    }
  } catch (err) {
    console.error("Vendor fetch failed:", err);
    throw err; // important: re-throw so React Query knows the query failed
  }
};



const fetchVendorById= async ({
  api,
  id,
}: {
  api: TApiClient;
  id: string;
}): Promise<TGetVendorsByIDResponse> => {

  try {
    const res = await api.Vendor.getVendorByID({ params:{id} });

    // Check if the API returned successfully
    if (res.status === 200) {
      return res.body; // ✅ return the response data
    } else {
      throw res.body; // ❌ throw to be caught by React Query
    }
  } catch (err) {
    console.error("Vendor fetch failed:", err);
    throw err; // important: re-throw so React Query knows the query failed
  }
};


// React Query hooks

export const useGetAllVendors = ({
  query,
}: {
  query?: TGetVendorsQuery;
} = {}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [
      QUERY_KEYS.VENDORS.ALL_VENDORSS, 
      query?.isFeatured ? "featured" : "regular",
      query
     ],
    queryFn: () => fetchAllVendors({ api, query }),
    placeholderData: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  });

}



export const useGetVenoorById = ({
  id,
  enabled = true,
}: {
  id: string;
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.VENDORS.GET_VENDOR_BY_ID, id],
    queryFn: () => fetchVendorById({ api, id }),
    enabled: enabled && !!id,
  });
};

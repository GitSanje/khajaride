import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";



// Type definitions for VENDOR operations

export type TGetVendorsQuery = TRequests["Vendor"]["getVendors"]["query"];


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

    const res = await api.Vendor.getVendors({query})
  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }

}

// React Query hooks

export const useGetAllVendors = ({
  query,
}: {
  query?: TGetVendorsQuery;
} = {}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.VENDORS.ALL_VENDORSS, query],
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
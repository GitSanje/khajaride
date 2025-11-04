import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";
import { toast } from "sonner";



// Type definitions for VENDOR operations

export type TGetVendorsQuery = TRequests["Vendor"]["getVendors"]["query"];


export type TCreateVendorPayload= TRequests["Vendor"]['createVendor']['body'];

export type TCreateVendorResponse = ServerInferResponseBody<
  typeof apiContract.Vendor.createVendor,
  201
>;


export type TCreateVendorAddressPayload= TRequests["Vendor"]['createVendorAddress']['body'];

export type TCreateVendorAddressResponse = ServerInferResponseBody<
  typeof apiContract.Vendor.createVendorAddress,
  201
>;

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



const createVendor= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TCreateVendorPayload;
}): Promise<TCreateVendorResponse> => {
  const res = await api.Vendor.createVendor({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


export const useCreateVendor = () => {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({ body }: { body: TCreateVendorPayload }) => createVendor({ api, data: body }),
    onSuccess: () => {
      toast.success("Vendor created successfully!")
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create vendor");
    },
  });
};



const createVendorAddress= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TCreateVendorAddressPayload;
}): Promise<TCreateVendorAddressResponse> => {
  const res = await api.Vendor.createVendorAddress({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};



export const useCreateVendorAddress = () => {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({ body }: { body: TCreateVendorAddressPayload }) => createVendorAddress({ api, data: body }),
    onSuccess: () => {
      toast.success("Vendor addresses created successfully!")
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create vendor");
    },
  });
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

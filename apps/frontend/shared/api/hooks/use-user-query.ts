
import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";
import { toast } from "sonner";




export type TCreateAddressPayload = TRequests['User']['createAddress']['body'];
export type TCreateAddressResponse = ServerInferResponseBody<
  typeof apiContract.User.createAddress,
  201
>;



export type TCreateUserPayload = TRequests['User']['createUser']['body'];
export type TCreateUserResponse = ServerInferResponseBody<
  typeof apiContract.User.createUser,
  201
>;


export type TGetAddressesResponse = ServerInferResponseBody<
  typeof apiContract.User.listAddresses,
  200
>;


export type TVendorOnboardingTrack = TRequests['User']['VendorOnboardingTrack']['body'];


const UpdateVendorOnboardingTrack= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TVendorOnboardingTrack;
}): Promise<TVendorOnboardingTrack> => {
  const res = await api.User.VendorOnboardingTrack({ body: data });

  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};

export const useUpdateVendorOnboardingTrack = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TVendorOnboardingTrack }) => UpdateVendorOnboardingTrack({ api, data: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER.GET_VENDOR_ONBOARDING_TRACK],
        
      });
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to update VENDOR_ONBOARDING_TRACK");
    },
  });
};


const GetVendorOnboardingTrack= async ({
  api
}: {
  api: TApiClient;
 
}): Promise<TVendorOnboardingTrack> => {
  const res = await api.User.getVendorOnboardingTrack();

  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};

export const useGetVendorOnboardingTrack= ({
  
  enabled = true,
}: {
  
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.USER.GET_VENDOR_ONBOARDING_TRACK],
    queryFn: () => GetVendorOnboardingTrack({ api }),
    enabled: enabled,
  });
};




const CreateAddress= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TCreateAddressPayload;
}): Promise<TCreateAddressResponse> => {
  const res = await api.User.createAddress({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};





const CreateUser= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TCreateUserPayload;
}): Promise<TCreateUserResponse> => {
  const res = await api.User.createUser({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


const GetAddresses= async ({
  api
}: {
  api: TApiClient;
 
}): Promise<TGetAddressesResponse> => {
  const res = await api.User.listAddresses();

  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};


export const useCreateAddress = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TCreateAddressPayload }) => CreateAddress({ api, data: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USER.GET_ADDRESSES],
        
      });
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create address");
    },
  });
};

  
export const useCreateUser = () => {
  const api = useApiClient();
  return useMutation({
    mutationFn: ({ body }: { body: TCreateUserPayload }) => CreateUser({ api, data: body }),
    onSuccess: () => {
      toast.success("Account created successfully!")
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create address");
    },
  });
};


export const useGetAddresses= ({
  
  enabled = true,
}: {
  
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.USER.GET_ADDRESSES],
    queryFn: () => GetAddresses({ api }),
    enabled: enabled,
  });
};



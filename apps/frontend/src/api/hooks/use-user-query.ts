
import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";




export type TCreateAddressPayload = TRequests['User']['createAddress']['body'];
export type TCreateAddressResponse = ServerInferResponseBody<
  typeof apiContract.User.createAddress,
  201
>;


export type TGetAddressesResponse = ServerInferResponseBody<
  typeof apiContract.User.listAddresses,
  200
>;


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



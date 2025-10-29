import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";
import { toast } from "sonner";


export type TCreateOrderPayload = TRequests['Order']['createOrder']['body']


export type TCreateOrderResponse = ServerInferResponseBody<
  typeof apiContract.Order.createOrder,
  201
>;

const CreateOrder = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TCreateOrderPayload;
}): Promise<TCreateOrderResponse> => {
  const res = await api.Order.createOrder({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


export const useCreateOrder = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TCreateOrderPayload }) => CreateOrder({ api, data: body }),
    onSuccess: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: [QUERY_KEYS.ORDER.GET_CART_ITEMS],
    //   });
    
     
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create order");
    },
  });
};
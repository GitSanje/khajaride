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


export type TGetUserOrdersRespone =  ServerInferResponseBody<
  typeof apiContract.Order.getOrdersByUserId,
  200
>;

export type TGetOrderByIdRespone =  ServerInferResponseBody<
  typeof apiContract.Order.getOrderById,
  200
>;



export type TG = TRequests['Cart']['deleteCartItem']['params'];



const GetUserOrders = async ({
  api,
  userId

}: {
  api: TApiClient;
  userId?:string
  
}): Promise<TGetUserOrdersRespone> => {
  const res = await api.Order.getOrdersByUserId({ params:{ userId}});
  
  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};



const GetOrderById = async ({
  api,
  id

}: {
  api: TApiClient;
  id:string
  
}): Promise<TGetOrderByIdRespone> => {
  const res = await api.Order.getOrderById({ params:{ id}});
  
  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};




export const useGetOrderById= ({
  
  enabled = true,
  id
}: {
  id:string
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.ORDER.GET_ORDER_BY_ID],
    queryFn: () => GetOrderById({ api,id}),
    enabled: enabled,
  });
};




export const useGetOrdersByUserId= ({
  
  enabled = true,
  userId
}: {
  userId?:string
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.ORDER.GET_USER_ORDERS],
    queryFn: () => GetUserOrders({ api,userId}),
    enabled: enabled,
  });
};


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
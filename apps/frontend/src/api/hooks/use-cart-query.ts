
import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";



export type TAddCartItemPayload = TRequests['Cart']['addCartItem']['body'];
export type TAddCartItemResponse = ServerInferResponseBody<
  typeof apiContract.Cart.addCartItem,
  201
>;

export type TGetCartItemsRespone =  ServerInferResponseBody<
  typeof apiContract.Cart.getCart,
  200
>;
export type TDeleteCartItemsParam = TRequests['Cart']['deleteCartItem']['params'];

export type TAddJustQuantityPayload = TRequests['Cart']['adjustCartItemQuantity']['body'];
export type TAddJustQuantityRespone =  ServerInferResponseBody<
  typeof apiContract.Cart.adjustCartItemQuantity,
  200
>;


const GetCartItems = async ({
  api

}: {
  api: TApiClient;
  
}): Promise<TGetCartItemsRespone> => {
  const res = await api.Cart.getCart();
  
  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};





const DeleteCartItem = async ({
  api,
  id,
}: {
  api: TApiClient;
  id: string;
}): Promise<void> => {
  const res = await api.Cart.deleteCartItem({ params: { id } });
  
  if (res.status !== 204) {
    throw res.body;
  }
};


const AddCartItem = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TAddCartItemPayload;
}): Promise<TAddCartItemResponse> => {
  const res = await api.Cart.addCartItem({ body: data });
  
  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


const AddJustCartItemQuantity = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TAddJustQuantityPayload;
}): Promise<TAddJustQuantityRespone> => {
  const res = await api.Cart.adjustCartItemQuantity({ body: data });
  
  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};



export const useAddJustCartItemQuantity = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TAddJustQuantityPayload }) => AddJustCartItemQuantity({ api, data: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CART.GET_CART_ITEMS],
      });
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to update quantity");
    },
  });
};



export const useAddCartItem = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TAddCartItemPayload }) => AddCartItem({ api, data: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CART.GET_CART_ITEMS],
      });
     
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create todo");
    },
  });
};


export const useGetCartItems= ({
  
  enabled = true,
}: {
  
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.CART.GET_CART_ITEMS],
    queryFn: () => GetCartItems({ api}),
    enabled: enabled,
  });
};


export const useDeleteCartItem = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartId }: { cartId: string }) => DeleteCartItem({ api, id: cartId }),
     onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CART.GET_CART_ITEMS],
      });
     
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to delete cart item");
    },
  });
};

import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";
import { toast } from "sonner";



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



export type TGetCartTotalsQuery = TRequests['Cart']['getCartTotals']['query'];

export type TGetCartTotalsResponse =  ServerInferResponseBody<
  typeof apiContract.Cart.getCartTotals,
  200
>;


export type TApplyCouponPayload = TRequests['Cart']['applyCoupon']['body'];

export type TApplyCouponResponse =  ServerInferResponseBody<
  typeof apiContract.Cart.applyCoupon,
  201
>;



const ApplyCoupon= async ({
  api,
  data

}: {
  api: TApiClient;
  data: TApplyCouponPayload;
}): Promise<TApplyCouponResponse> => {
  const res = await api.Cart.applyCoupon({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


const GetCartTotals= async ({
  api,
  query

}: {
  api: TApiClient;
  query: TGetCartTotalsQuery;
}): Promise<TGetCartTotalsResponse> => {
  const res = await api.Cart.getCartTotals({ query });

  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};



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

export const useApplyCoupon = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TApplyCouponPayload }) => ApplyCoupon({ api, data: body }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CART.GET_CART_TOTALS],
      });
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to update quantity");
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


export const useGetCartTotals = ({
  query,
  enabled = true,
}: {
  query: TGetCartTotalsQuery;
  enabled?: boolean;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.CART.GET_CART_TOTALS],
    queryFn: () => GetCartTotals({ query, api }),
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
      toast.success("Item removed from cart!");
    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to delete cart item");
    },
  });
};
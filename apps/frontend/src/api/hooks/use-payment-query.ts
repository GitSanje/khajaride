import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";
import { showApiErrorToast } from "../utils";
import { toast } from "sonner";


export type TInitiateKhaltiPaymentPayload = TRequests['Payment']['initiateKhaltiPayment']['body']

export type TInitiateStripePaymentPayload = TRequests['Payment']['initiateStripePayment']['body']


export type InitiateKhaltiPaymentResponse = ServerInferResponseBody<
  typeof apiContract.Payment.initiateKhaltiPayment,
  201
>;

export type InitiateStripePaymentResponse = ServerInferResponseBody<
  typeof apiContract.Payment.initiateStripePayment,
  201
>;

export type TVerifyKhaltiPaymentPayload = TRequests['Payment']['verifyKhaltiPayment']['body']


export type VerifyKhaltiPaymentResponse = ServerInferResponseBody<
  typeof apiContract.Payment.verifyKhaltiPayment,
  200
>;


const InitiateKhaltiPayment = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TInitiateKhaltiPaymentPayload;
}): Promise<InitiateKhaltiPaymentResponse> => {
  const res = await api.Payment.initiateKhaltiPayment({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


const VerifyKhaltiPayment = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TVerifyKhaltiPaymentPayload;
}): Promise<VerifyKhaltiPaymentResponse> => {
  const res = await api.Payment.verifyKhaltiPayment({ body: data });

  if (res.status === 200) {
    return res.body;
  } else {
    throw res.body;
  }
};



const InitiateStripePayment = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TInitiateStripePaymentPayload;
}): Promise<InitiateStripePaymentResponse> => {
  const res = await api.Payment.initiateStripePayment({ body: data });

  if (res.status === 201) {
    return res.body;
  } else {
    throw res.body;
  }
};


export const useInitiateStripePayment= () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TInitiateStripePaymentPayload }) => InitiateStripePayment({ api, data: body }),
    onSuccess: () => {

    },
    onError: (err) => {
      showApiErrorToast(err, "Failed to create order");
    },
  });
};



export const useInitiateKhaltiPayment = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TInitiateKhaltiPaymentPayload }) => InitiateKhaltiPayment({ api, data: body }),
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



export const useVerifyKhaltiPayment = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body }: { body: TVerifyKhaltiPaymentPayload }) => VerifyKhaltiPayment({ api, data: body }),
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
import { type TApiClient, useApiClient } from "@/api";
import type { TRequests } from "../types";
import type { ServerInferResponseBody } from "@ts-rest/core";
import type { apiContract } from "@khajaride/openapi/contracts";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../query-utils";




export type TGetSearchPayload= TRequests["Search"]["fullTextSearch"]["body"];

export type TGetSearchResponse = ServerInferResponseBody<
  typeof apiContract.Search.fullTextSearch,
  200
>;
const fetchSearchQuery = async ({
  api,
  data,
}: {
  api: TApiClient;
  data: TGetSearchPayload;
}): Promise<TGetSearchResponse> => {

  try {
    const res = await api.Search.fullTextSearch({ body:data });

    // Check if the API returned successfully
    if (res.status === 200) {
      return res.body; // ✅ return the response data
    } else {
      throw res.body; // ❌ throw to be caught by React Query
    }
  } catch (err) {
    console.error("Search fetch failed:", err);
    throw err; 
  }
};


export const useGetSearchQuery = ({
  data
}: {

  data: TGetSearchPayload;
}) => {
  const api = useApiClient();

  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH.FULL_TEXT_SEARCH,data],
    queryFn: () => fetchSearchQuery({ api, data }),
    staleTime:1000 * 60,
  });
};

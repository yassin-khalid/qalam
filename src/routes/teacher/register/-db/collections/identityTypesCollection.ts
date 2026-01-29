import { createCollection } from "@tanstack/react-db";
import { getIdentityTypes } from "../../-api/identityTypes";
import { queryClient } from "queryClient";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

export const createIdentityTypesCollection = (isInSaudiArabia: boolean) => createCollection(queryCollectionOptions({
  queryKey: ["identity-types"],

  queryFn: async () => {
    const response = await getIdentityTypes({
      token: localStorage.getItem("token") ?? "",
      isInSaudiArabia: isInSaudiArabia,
    });
    return response.data
  },
  queryClient,
  getKey: (item) => item.value,
}));


export const SaudiIdentityTypesCollection = createIdentityTypesCollection(true);
export const NonSaudiIdentityTypesCollection = createIdentityTypesCollection(false);
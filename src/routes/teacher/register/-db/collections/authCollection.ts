import { createCollection } from "@tanstack/db";
import { sendOtp } from "../../-api/sendOtp";
import z from "zod";
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { queryClient } from "queryClient";

const authSchema = z.object({
    phoneNumber: z.string(),
    countryCode: z.string()
});

type AuthData = z.infer<typeof authSchema>;

const authCollection = createCollection(queryCollectionOptions({
    queryKey: ['auth'],
    queryFn: async (): Promise<AuthData[]> => {
        // const response = await queryClient.getQueryData<AuthData[]>(['auth']);
        // return response || [];
        return []
    },
    getKey: (data) => data.phoneNumber,
    queryClient,
    schema: authSchema,
    onInsert: async ({transaction}) => {
        const { phoneNumber, countryCode } = transaction.mutations[0].modified;
        try {
            await sendOtp({ phoneNumber, countryCode });
            return { refetch: false };
        } catch (error) {
            // Re-throw the error so TanStack DB can rollback the optimistic update
            throw error;
        }
    }
}));

export { authCollection };
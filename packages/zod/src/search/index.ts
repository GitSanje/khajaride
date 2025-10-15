import { z } from "zod";

export const ZInsertDocPayloadSchema = z.object({
  index_name: z.string().nonempty("index_name is required"),
  doc: z.record(z.any()).refine((val) => val !== null, {
    message: "doc is required",
  }),
});

export type InsertDocPayload = z.infer<typeof ZInsertDocPayloadSchema>;

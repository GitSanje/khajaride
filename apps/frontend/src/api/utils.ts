import { toast } from "sonner";

export const QUERY_KEYS = {} as const satisfies Record<
  Uppercase<string>,
  object
>;

export const showApiErrorToast = (error: unknown, fallbackMessage: string) => {
  const message = 
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : fallbackMessage;
  
  console.error(message, error);
  toast.error(message);
};
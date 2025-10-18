

export type TAddCartItem = {
    vendorId: string;
    id: string;
    quantity: number;
    basePrice: number;
    discountAmount?: number | undefined;
    specialInstructions?: string | undefined;
}
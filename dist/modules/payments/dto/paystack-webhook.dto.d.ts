declare class PaystackCustomerDto {
    id: number;
    email: string;
}
declare class PaystackAuthorizationDto {
    authorization_code: string;
    card_type?: string;
    bank?: string;
    channel?: string;
}
export declare class PaystackWebhookDataDto {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message?: string;
    gateway_response: string;
    paid_at?: string;
    channel?: string;
    currency?: string;
    customer: PaystackCustomerDto;
    authorization?: PaystackAuthorizationDto;
    metadata?: any;
}
export declare class PaystackWebhookDto {
    event: string;
    data: PaystackWebhookDataDto;
}
export {};

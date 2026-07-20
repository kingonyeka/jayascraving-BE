export declare enum QuoteResponse {
    ACCEPT = "ACCEPT",
    REJECT = "REJECT",
    NEGOTIATE = "NEGOTIATE"
}
export declare class RespondToQuoteInput {
    quoteId: string;
    response: QuoteResponse;
    message?: string;
}

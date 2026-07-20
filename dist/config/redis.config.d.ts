declare const _default: (() => {
    url: string;
    ttl: number;
    queueOptions: {
        attempts: number;
        backoff: {
            type: string;
            delay: number;
        };
        removeOnComplete: boolean;
        removeOnFail: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    ttl: number;
    queueOptions: {
        attempts: number;
        backoff: {
            type: string;
            delay: number;
        };
        removeOnComplete: boolean;
        removeOnFail: boolean;
    };
}>;
export default _default;

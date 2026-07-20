export declare const queueDefaults: {
    defaultJobOptions: {
        attempts: number;
        backoff: {
            type: "exponential";
            delay: number;
        };
        removeOnComplete: boolean;
        removeOnFail: boolean;
    };
};

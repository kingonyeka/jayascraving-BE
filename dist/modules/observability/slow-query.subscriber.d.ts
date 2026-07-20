import { EntitySubscriberInterface } from 'typeorm';
export declare class SlowQuerySubscriber implements EntitySubscriberInterface {
    private readonly logger;
    beforeQuery(event: {
        query: string;
        parameters?: any[];
    }): void;
    afterQuery(event: {
        query: string;
        parameters?: any[];
        executionTime?: number;
    }): void;
}

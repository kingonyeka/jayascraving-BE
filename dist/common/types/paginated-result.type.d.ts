import { Type } from '@nestjs/common';
export interface IPaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export declare function PaginatedResult<T>(ItemType: Type<T>): abstract new () => {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
export declare function buildPaginatedResult<T>(data: T[], total: number, page: number, limit: number): IPaginatedResult<T>;

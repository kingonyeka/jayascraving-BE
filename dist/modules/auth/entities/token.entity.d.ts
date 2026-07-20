export declare class Token {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
}

export declare class AuditLog {
    id: string;
    performedBy: string;
    performedByName: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: string;
    after?: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
}

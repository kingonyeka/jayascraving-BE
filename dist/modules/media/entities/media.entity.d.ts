export declare enum MediaCategory {
    PRODUCT = "PRODUCT",
    REVIEW = "REVIEW",
    CUSTOM_ORDER = "CUSTOM_ORDER",
    CUSTOM_ORDER_PROOF = "CUSTOM_ORDER_PROOF",
    AVATAR = "AVATAR",
    CATEGORY = "CATEGORY"
}
export declare enum MediaFileType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO"
}
export declare class Media {
    id: string;
    uploadedBy: string;
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
    fileType: MediaFileType;
    category: MediaCategory;
    referenceId?: string;
    thumbnailUrl?: string;
    thumbnailKey?: string;
    createdAt: Date;
}

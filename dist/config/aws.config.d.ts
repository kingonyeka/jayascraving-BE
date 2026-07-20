declare const _default: (() => {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3: {
        bucket: string;
        signedUrlExpiry: number;
        maxImageSize: number;
        maxVideoSize: number;
        allowedImageTypes: string[];
        allowedVideoTypes: string[];
    };
    cloudfront: {
        url: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3: {
        bucket: string;
        signedUrlExpiry: number;
        maxImageSize: number;
        maxVideoSize: number;
        allowedImageTypes: string[];
        allowedVideoTypes: string[];
    };
    cloudfront: {
        url: string;
    };
}>;
export default _default;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('aws', () => ({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
        bucket: process.env.S3_BUCKET,
        signedUrlExpiry: parseInt(process.env.S3_SIGNED_URL_EXPIRY || '300', 10),
        maxImageSize: 5 * 1024 * 1024,
        maxVideoSize: 50 * 1024 * 1024,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    },
    cloudfront: {
        url: process.env.CLOUDFRONT_URL,
    },
}));
//# sourceMappingURL=aws.config.js.map
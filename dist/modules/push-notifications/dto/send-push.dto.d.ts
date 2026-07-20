export interface SendPushDto {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export interface SendPushToMultipleDto {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export interface SendPushToTopicDto {
    topic: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}

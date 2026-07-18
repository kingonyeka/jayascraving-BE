export interface SendPushDto {
  token: string;           // FCM device token
  title: string;
  body: string;
  data?: Record<string, string>; // extra payload (e.g. orderId, screen to navigate to)
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
  topic: string;           // FCM topic e.g. "promotions", "all-users"
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}
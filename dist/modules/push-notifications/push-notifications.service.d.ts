import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendPushDto, SendPushToMultipleDto, SendPushToTopicDto } from './dto/send-push.dto';
export declare class PushNotificationsService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private app;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    sendToDevice(dto: SendPushDto): Promise<boolean>;
    sendToMultiple(dto: SendPushToMultipleDto): Promise<{
        success: number;
        failure: number;
    }>;
    sendToTopic(dto: SendPushToTopicDto): Promise<boolean>;
    subscribeToTopic(tokens: string[], topic: string): Promise<void>;
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<void>;
    notifyOrderStatus(fcmToken: string, orderNumber: string, status: string, orderId: string): Promise<void>;
    notifyPaymentSuccess(fcmToken: string, orderNumber: string, amount: number): Promise<void>;
    notifyCustomOrderQuote(fcmToken: string, requestNumber: string): Promise<void>;
    broadcastPromotion(title: string, body: string, promoCode?: string): Promise<void>;
}

export interface DeliveryReminderData {
    customerName: string;
    orderNumber: string;
    deliveryDate: string;
    deliveryTimeSlot?: string;
    deliveryAddress?: string;
}
export declare function deliveryReminderTemplate(data: DeliveryReminderData): {
    subject: string;
    html: string;
};

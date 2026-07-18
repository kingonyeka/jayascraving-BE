// ─── Queue names ──────────────────────────────────────────────────────────────
// Note: the email queue is registered/named separately as EMAIL_QUEUE in
// notifications/processors/email.processor.ts (also 'email') — that's the
// one actually wired up via NotificationsModule. Previously this file also
// declared QUEUE_EMAIL and QUEUE_NOTIFICATION, but neither was ever
// registered with BullModule or read anywhere — dead duplicate constants,
// removed.
export const QUEUE_ORDER = 'order';
export const QUEUE_PAYMENT = 'payment';
export const QUEUE_INVENTORY = 'inventory';
export const QUEUE_ABANDONED_CART = 'abandoned-cart';

// ─── Job names ────────────────────────────────────────────────────────────────

// order queue
export const JOB_ORDER_AUTO_CANCEL = 'order:auto-cancel';
export const JOB_ORDER_DELIVERY_REMINDER = 'order:delivery-reminder';

// payment queue
export const JOB_PAYMENT_VERIFY = 'payment:verify';
export const JOB_PAYMENT_TIMEOUT = 'payment:timeout';

// inventory queue
export const JOB_INVENTORY_LOW_STOCK_ALERT = 'inventory:low-stock-alert';
export const JOB_INVENTORY_STOCK_UPDATE = 'inventory:stock-update';

// abandoned cart queue
export const JOB_CART_SEND_RECOVERY = 'cart:send-recovery-email';
export const JOB_CART_CLEANUP = 'cart:cleanup-expired';

export const TRIGGER_TYPE_WEBHOOK = "Webhook";
export const TRIGGER_TYPE_API = "API";
export const TRIGGER_TYPE_MANUAL = "Manual";
export const TRIGGER_TYPE_SCHEDULE = "Schedule";
export const TRIGGER_TYPE_EMAIL = "Email";

export const TRIGGER_TYPES = [ TRIGGER_TYPE_WEBHOOK, TRIGGER_TYPE_API,
    TRIGGER_TYPE_MANUAL, TRIGGER_TYPE_SCHEDULE, TRIGGER_TYPE_EMAIL];

export type TriggerType = typeof TRIGGER_TYPE_WEBHOOK | typeof TRIGGER_TYPE_API | typeof TRIGGER_TYPE_MANUAL | typeof TRIGGER_TYPE_SCHEDULE | typeof TRIGGER_TYPE_EMAIL;

export const HTTP_GET = "GET";
export const HTTP_POST = "POST";
export const HTTP_PUT = "PUT";
export const HTTP_DELETE = "DELETE";

export const SERVICE_METHODS = [HTTP_GET, HTTP_PUT, HTTP_DELETE, HTTP_POST];
export const WEBHOOK_METHODS = [HTTP_GET, HTTP_POST];

export type ServiceMethodType = typeof HTTP_GET | typeof HTTP_PUT | typeof HTTP_DELETE | typeof HTTP_POST;
export interface ServiceTriggerConfig {
    serviceName: string;
    resourceName: string;
    method: ServiceMethodType;
    port: number;
}

export type WebhookMethodType = typeof HTTP_GET | typeof HTTP_POST;

export interface WebhookTriggerConfig extends ServiceTriggerConfig {
    method: WebhookMethodType;
}

export interface ScheduleTriggerConfig {
    cron: string;
}

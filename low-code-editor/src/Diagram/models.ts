export const TRIGGER_TYPE_WEBHOOK = "Webhook";
export const TRIGGER_TYPE_API = "API";
export const TRIGGER_TYPE_MANUAL = "Manual";
export const TRIGGER_TYPE_SCHEDULE = "Schedule";
export const TRIGGER_TYPE_EMAIL = "Email";
export const TRIGGER_TYPE_SERVICE_DRAFT = "Service Draft";
export const TRIGGER_TYPE_INTEGRATION_DRAFT = "Integration Draft";

export const TRIGGER_TYPES = [TRIGGER_TYPE_WEBHOOK, TRIGGER_TYPE_API,
    TRIGGER_TYPE_MANUAL, TRIGGER_TYPE_SCHEDULE, TRIGGER_TYPE_EMAIL];

export type TriggerType = typeof TRIGGER_TYPE_WEBHOOK
    | typeof TRIGGER_TYPE_API
    | typeof TRIGGER_TYPE_MANUAL
    | typeof TRIGGER_TYPE_SCHEDULE
    | typeof TRIGGER_TYPE_EMAIL
    | typeof TRIGGER_TYPE_SERVICE_DRAFT
    | typeof TRIGGER_TYPE_INTEGRATION_DRAFT;

export const HTTP_GET = "GET";
export const HTTP_POST = "POST";
export const HTTP_PUT = "PUT";
export const HTTP_DELETE = "DELETE";
export const HTTP_OPTIONS = "OPTIONS";
export const HTTP_HEAD = "HEAD";
export const HTTP_PATCH = "PATCH";

export const SERVICE_METHODS = [HTTP_GET, HTTP_PUT, HTTP_DELETE, HTTP_POST, HTTP_OPTIONS, HTTP_HEAD, HTTP_PATCH];
export const WEBHOOK_METHODS = [HTTP_GET, HTTP_POST];

export type ServiceMethodType = typeof HTTP_GET | typeof HTTP_PUT | typeof HTTP_DELETE | typeof HTTP_POST | typeof HTTP_OPTIONS | typeof HTTP_HEAD | typeof HTTP_PATCH;
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

// types related track lowcode events
export const EVENT_TYPE_AZURE_APP_INSIGHTS = "azure_app_insights";

export const TRIGGER_SELECTED_INSIGHTS = "triggerSelected";
export const START_STATEMENT_ADD_INSIGHTS = "startStatement";
export const FINISH_STATEMENT_ADD_INSIGHTS = "finishStatement";
export const START_CONNECTOR_ADD_INSIGHTS = "startConnector";
export const START_EXISTING_CONNECTOR_ADD_INSIGHTS = "startExistingConnector";
export const FINISH_CONNECTOR_INIT_ADD_INSIGHTS = "finishConnectorInit";
export const CONTINUE_TO_INVOKE_API = "continueToInvokeAPI";
export const CONNECTOR_CLOSED = "connectorClosed";
export const FINISH_CONNECTOR_ACTION_ADD_INSIGHTS = "finishConnectorAction";
export const API_TAB_SELECTION_INSIGHTS = "apiTabSelection";

export const ADD_VARIABLE = "editor-workspace-add-variable";
export const SAVE_VARIABLE = "editor-workspace-save-variable";
export const ADD_CONNECTOR = "editor-workspace-add-connector";
export const SAVE_CONNECTOR = "editor-workspace-save-connector";
export const ADD_OTHER_STATEMENT = "editor-workspace-add-other-statement";
export const SAVE_OTHER_STATEMENT = "editor-workspace-save-other-statement";

export type EVENT_TYPE = typeof EVENT_TYPE_AZURE_APP_INSIGHTS | typeof ADD_VARIABLE | typeof SAVE_VARIABLE | typeof ADD_CONNECTOR | typeof SAVE_CONNECTOR |
typeof ADD_OTHER_STATEMENT | typeof SAVE_OTHER_STATEMENT;
export type EVENT_NAME = typeof TRIGGER_SELECTED_INSIGHTS | typeof START_STATEMENT_ADD_INSIGHTS |
    typeof FINISH_STATEMENT_ADD_INSIGHTS | typeof START_CONNECTOR_ADD_INSIGHTS |
    typeof FINISH_CONNECTOR_INIT_ADD_INSIGHTS | typeof FINISH_CONNECTOR_ACTION_ADD_INSIGHTS |
    typeof START_EXISTING_CONNECTOR_ADD_INSIGHTS | typeof API_TAB_SELECTION_INSIGHTS | typeof CONTINUE_TO_INVOKE_API |
    typeof CONNECTOR_CLOSED | '';

export interface LowcodeEvent {
    type: EVENT_TYPE;
    name: EVENT_NAME;
    property?: any;
}

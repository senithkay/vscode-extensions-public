import {
    ComponentDisplayType,
    ComponentKind,
    ChoreoImplementationType,
    ChoreoComponentType,
} from "@wso2-enterprise/choreo-core";

export const getTypeForDisplayType = (displayType: string): string => {
    switch (displayType) {
        case ComponentDisplayType.RestApi:
        case ComponentDisplayType.Service:
        case ComponentDisplayType.ByocService:
        case ComponentDisplayType.GraphQL:
        case ComponentDisplayType.MiApiService:
        case ComponentDisplayType.MiRestApi:
        case ComponentDisplayType.BuildpackService:
        case ComponentDisplayType.BuildRestApi:
        case ComponentDisplayType.Websocket:
            return ChoreoComponentType.Service;
        case ComponentDisplayType.ManualTrigger:
        case ComponentDisplayType.ByocJob:
        case ComponentDisplayType.BuildpackJob:
        case ComponentDisplayType.MiJob:
            return ChoreoComponentType.ManualTrigger;
        case ComponentDisplayType.ScheduledTask:
        case ComponentDisplayType.ByocCronjob:
        case ComponentDisplayType.BuildpackCronJob:
        case ComponentDisplayType.MiCronjob:
            return ChoreoComponentType.ScheduledTask;
        case ComponentDisplayType.Webhook:
        case ComponentDisplayType.MiWebhook:
        case ComponentDisplayType.ByocWebhook:
        case ComponentDisplayType.BuildpackWebhook:
        case ComponentDisplayType.BallerinaWebhook:
            return ChoreoComponentType.Webhook;
        case ComponentDisplayType.Proxy:
            return "api-proxy";
        case ComponentDisplayType.ByocWebApp:
        case ComponentDisplayType.ByocWebAppDockerLess:
        case ComponentDisplayType.BuildpackWebApp:
            return ChoreoComponentType.WebApplication;
        case ComponentDisplayType.MiEventHandler:
        case ComponentDisplayType.BallerinaEventHandler:
        case ComponentDisplayType.BuildpackEventHandler:
        case ComponentDisplayType.ByocEventHandler:
            return "event-handler";
        case ComponentDisplayType.BuildpackTestRunner:
            return "test";
        default:
            return displayType;
    }
};

export const getFriendlyComponentType = (componentType: string): string => {
    switch (componentType) {
        case ChoreoComponentType.Service:
            return "Service";
        case ChoreoComponentType.ManualTrigger:
            return "Manual Trigger"
        case ChoreoComponentType.ScheduledTask:
            return "Scheduled Task"
        case ChoreoComponentType.WebApplication:
            return "Web Application"
            case ChoreoComponentType.Webhook:
                return "Webhook"
        default:
            return componentType;
    }
};

export const getBuildpackForComponent = (component: ComponentKind) => {
    let lang = "";
    if (component.spec.build?.buildpack?.language) {
        lang = component.spec.build?.buildpack?.language;
    } else if (component.spec.build?.ballerina) {
        lang = ChoreoImplementationType.Ballerina;
    } else if (component.spec.build?.docker?.dockerFilePath) {
        lang = ChoreoImplementationType.Docker;
    } else if (component.spec.build?.webapp?.type) {
        lang = component.spec.build?.webapp?.type;
    }

    return lang.toLowerCase();
};

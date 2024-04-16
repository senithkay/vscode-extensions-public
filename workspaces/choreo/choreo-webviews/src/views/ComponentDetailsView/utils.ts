import { ComponentDisplayType, ComponentKind, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";

export const getTypeForDisplayType = (displayType: string): string => {
    switch (displayType) {
        case ComponentDisplayType.RestApi:
        case ComponentDisplayType.Service:
        case ComponentDisplayType.ByocService:
        case ComponentDisplayType.GraphQL:
        case ComponentDisplayType.ByocRestApi:
        case ComponentDisplayType.MiApiService:
        case ComponentDisplayType.ByoiService:
        case ComponentDisplayType.BuildpackService:
        case ComponentDisplayType.BuildpackRestApi:
        case ComponentDisplayType.MiRestApi:
        case ComponentDisplayType.ThirdPartyAPI:
            return "service";
        case ComponentDisplayType.BuildpackJob:
        case ComponentDisplayType.ByoiJob:
        case ComponentDisplayType.ByocJob:
        case ComponentDisplayType.MiJob:
        case ComponentDisplayType.ManualTrigger:
            return "manual-task";
        case ComponentDisplayType.BuildpackCronJob:
        case ComponentDisplayType.ByoiCronjob:
        case ComponentDisplayType.ByocCronjob:
        case ComponentDisplayType.MiCronjob:
        case ComponentDisplayType.ScheduledTask:
            return "scheduled-task";
        case ComponentDisplayType.BuildpackWebhook:
        case ComponentDisplayType.ByocWebhook:
        case ComponentDisplayType.Webhook:
            return "web-hook";
        case ComponentDisplayType.Proxy:
            return "api-proxy";
        case ComponentDisplayType.ByocWebApp:
        case ComponentDisplayType.ByocWebAppDockerLess:
        case ComponentDisplayType.BuildpackWebApp:
        case ComponentDisplayType.ByoiWebApp:
            return "web-app";
        case ComponentDisplayType.MiEventHandler:
        case ComponentDisplayType.BallerinaEventHandler:
            return "event-handler";
        case ComponentDisplayType.ByocTestRunner:
        case ComponentDisplayType.PostmanTestRunner:
        case ComponentDisplayType.BuildpackTestRunner:
            return "test";
        default:
            return "";
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

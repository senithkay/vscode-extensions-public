/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoComponentType, ChoreoImplementationType, ComponentDisplayType, type ComponentKind } from "@wso2-enterprise/choreo-core";

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
		case ComponentDisplayType.ByoiService:
			return ChoreoComponentType.Service;
		case ComponentDisplayType.ManualTrigger:
		case ComponentDisplayType.ByocJob:
		case ComponentDisplayType.ByoiJob:
		case ComponentDisplayType.BuildpackJob:
		case ComponentDisplayType.MiJob:
			return ChoreoComponentType.ManualTrigger;
		case ComponentDisplayType.ScheduledTask:
		case ComponentDisplayType.ByocCronjob:
		case ComponentDisplayType.ByoiCronjob:
		case ComponentDisplayType.MiCronjob:
		case ComponentDisplayType.BuildpackCronJob:
			return ChoreoComponentType.ScheduledTask;
		case ComponentDisplayType.Webhook:
		case ComponentDisplayType.MiWebhook:
		case ComponentDisplayType.ByocWebhook:
		case ComponentDisplayType.BuildpackWebhook:
		case ComponentDisplayType.BallerinaWebhook:
			return ChoreoComponentType.Webhook;
		case ComponentDisplayType.Proxy:
			return ChoreoComponentType.ApiProxy;
		case ComponentDisplayType.ByocWebApp:
		case ComponentDisplayType.ByocWebAppDockerLess:
		case ComponentDisplayType.ByoiWebApp:
		case ComponentDisplayType.BuildpackWebApp:
			return ChoreoComponentType.WebApplication;
		case ComponentDisplayType.MiEventHandler:
		case ComponentDisplayType.BallerinaEventHandler:
		case ComponentDisplayType.BuildpackEventHandler:
		case ComponentDisplayType.ByocEventHandler:
			return ChoreoComponentType.EventHandler;
		case ComponentDisplayType.ByocTestRunner:
		case ComponentDisplayType.BuildpackTestRunner:
		case ComponentDisplayType.PostmanTestRunner:
			return ChoreoComponentType.TestRunner;
		default:
			return displayType;
	}
};

export const getComponentTypeText = (componentType: string): string => {
	switch (componentType) {
		case ChoreoComponentType.Service:
			return "Service";
		case ChoreoComponentType.ManualTrigger:
			return "Manual Task";
		case ChoreoComponentType.ScheduledTask:
			return "Scheduled Task";
		case ChoreoComponentType.WebApplication:
			return "Web Application";
		case ChoreoComponentType.Webhook:
			return "Webhook";
		case ChoreoComponentType.EventHandler:
			return "Event Handler";
		case ChoreoComponentType.TestRunner:
			return "Test Runner";
		case ChoreoComponentType.ApiProxy:
			return "API Proxy";
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

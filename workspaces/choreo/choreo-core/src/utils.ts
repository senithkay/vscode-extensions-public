/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoComponentType, ComponentDisplayType } from "./enums";
import { ComponentKind, Organization, Project } from "./types/common.types";

export const makeURLSafe = (input: string) => input?.trim()?.toLowerCase().replace(/\s+/g, "-");

export const getShortenedHash = (hash: string) => hash?.substring(0, 8);

export const getTimeAgo = (previousTime: Date): string => {
	const currentTime = new Date();
	const timeDifference = currentTime.getTime() - previousTime.getTime();

	const seconds = Math.floor(timeDifference / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);
	const years = Math.floor(months / 12);

	if (years > 0) {
		return `${years} year${years > 1 ? "s" : ""} ago`;
	}
	if (months > 0) {
		return `${months} month${months > 1 ? "s" : ""} ago`;
	}
	if (days > 0) {
		return `${days} day${days > 1 ? "s" : ""} ago`;
	}
	if (hours > 0) {
		return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	}
	if (minutes > 0) {
		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	}
	return "Just now";
};


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

export const toTitleCase = (str: string): string => {
	return str
		?.replaceAll("_", " ")
		?.toLowerCase()
		?.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const  toUpperSnakeCase = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase().replace(/\s+/g, '_');
}

export const toSentenceCase = (str: string): string => {
    const spacedString = str.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spacedString.charAt(0).toUpperCase() + spacedString.slice(1);
}

export const getComponentKey = (org: Organization, project: Project, component: ComponentKind): string => {
    return `${org.handle}-${project.handler}-${component.metadata.name}`
}

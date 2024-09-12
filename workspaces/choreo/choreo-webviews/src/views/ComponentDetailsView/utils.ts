/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoComponentType, ChoreoImplementationType, ComponentDisplayType, type ComponentKind } from "@wso2-enterprise/choreo-core";

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

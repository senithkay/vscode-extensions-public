/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface InboundConfig {
	name: string;
	port: number;
	type?: string;
	context?: string;
	schemaFilePath?: string;
}

export interface Endpoint extends InboundConfig {
	networkVisibility?: string;
}

export interface Inbound extends InboundConfig {
	visibility?: string;
}

export interface Outbound {
	serviceReferences: ServiceReference[];
}

export interface ServiceReferenceEnv {
	from: string;
	to: string;
}

export interface ServiceReference {
	name: string;
	connectionConfig: string;
	connectionType: string;
	env?: ServiceReferenceEnv[];
}

// endpoint.yaml
export interface EndpointYamlContent {
	version: string;
	endpoints: Endpoint[];
}

export interface ComponentMetadata {
	name: string;
	projectName: string;
	annotations: Record<string, string>;
}

// component.yaml
export interface ComponentYamlContent {
	apiVersion: "core.choreo.dev/v1beta1";
	kind: "ComponentConfig";
	// todo: remove metadata
	metadata?: ComponentMetadata;
	spec: {
		build?: { branch: string; revision?: string };
		image?: { registry: string; repository: string; tag: string };
		inbound?: Inbound[];
		outbound?: Outbound;
		configurations?: {
			keys?: { name: string; envName?: string; volume?: { mountPath: string } }[];
			groups?: {
				name: string;
				env?: { from: string; to: string }[];
				volume?: { mountPath: string; files: { from: string; to: string }[] }[];
			}[];
		};
	};
}

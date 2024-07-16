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

// component.yaml
export interface ComponentYamlContent {
	apiVersion: "core.choreo.dev/v1alpha1";
	kind: "ComponentConfig";
	metadata: {
		name: string;
		projectName: string;
		annotations: Record<string, string>;
	};
	spec: {
		build?: {
			branch: string;
			revision?: string;
		};
		image?: {
			registry: string;
			repository: string;
			tag: string;
		};
		inbound?: Inbound[];
		outbound?: Outbound;
		configurations?: {
			keys?: {
				name: string;
				envName?: string;
				volume?: { mountPath: string };
			}[];
			groups?: {
				name: string;
				env?: {
					from: string;
					to: string;
				}[];
				volume?: {
					mountPath: string;
					files: {
						from: string;
						to: string;
					}[];
				}[];
			}[];
		};
	};
}

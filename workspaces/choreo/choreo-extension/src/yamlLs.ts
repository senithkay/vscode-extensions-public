/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { ComponentYamlContent } from "@wso2-enterprise/choreo-core";
import { ext } from "./extensionVariables";

// COMPONENT_YAML_SCHEMA = "choreo";
// COMPONENT_YAML_SCHEMA_DIR = "schema/component-schema.json";

interface ComponentYamlSchema {
	$schema?: string;
	$id?: string;
	title?: string;
	description?: string;
	type: string;
	properties?: {
		[key: string]: ComponentYamlSchema;
	};
	definitions?: {
		[key: string]: ComponentYamlSchema;
	};
	allOf?: [
		{
			[key: string]: ComponentYamlSchema;
		},
	];
	default?: string;
	const?: string;
	enum?: string[];
	pattern?: string;
	format?: string;
	minLength?: number;
	items?: ComponentYamlSchema;
	required?: string[];
	$ref?: string;
}

// async function getComponentYamlMetadata():
//     Promise<{ project: Project; component: string, isLocalComponent: boolean } | undefined> {
//     const openedComponent = await ext.api.getOpenedComponentName();
//     // const project = await ext.api.getChoreoProject();
//     if (!openedComponent) {
//         return undefined;
//     }
//     const isLocalComponent = await ext.api.isLocalComponent(openedComponent);
//     if (isLocalComponent === undefined) {
//         return undefined;
//     }
//     // todo: fix following
//     return { project: {} as Project, component: openedComponent, isLocalComponent };
// }

// async function registerYamlLanguageServer(): Promise<void> {
//     try {
//         const yamlExtension = extensions.getExtension("redhat.vscode-yaml");
//         if (!yamlExtension) {
//             window.showErrorMessage(
//                 'Please install "YAML Language Support by Red Hat" extension to proceed'
//             );
//             return;
//         }
//         const yamlExtensionAPI = await yamlExtension.activate();
//         const SCHEMA = COMPONENT_YAML_SCHEMA;

//         // cache
//         const componentYamlCache = new Cache<ComponentYamlContent[], [number, string, string]>({
//             getDataFunc: (orgId: number, projectHandler: string, componentName: string) =>
//                 ext.clients.projectClient.getComponentConfig(orgId, projectHandler, componentName)
//         });

//         // Read the schema file content
//         const schemaFilePath = path.join(ext.context.extensionPath, COMPONENT_YAML_SCHEMA_DIR);

//         const schemaContent = fs.readFileSync(schemaFilePath, "utf8");
//         const schemaContentJSON = JSON.parse(schemaContent) as ComponentYamlSchema;

//         function onRequestSchemaURI(resource: string): string | undefined {
//             if (/\.choreo\/component.*\.yaml$/.test(resource)) {
//                 return `${SCHEMA}://schema/component-yaml`;
//             }
//             return undefined;
//         }

//         function onRequestSchemaContent(schemaUri: string): Promise<string> | undefined {
//             const parsedUri = Uri.parse(schemaUri);
//             if (parsedUri.scheme !== SCHEMA) {
//                 return undefined;
//             }
//             if (!parsedUri.fsPath || !parsedUri.fsPath.startsWith("/")) {
//                 return undefined;
//             }

//             return new Promise(async (resolve, reject) => {
//                 // const componentMetadata = await getComponentYamlMetadata();
//                 // if (!componentMetadata) {
//                     resolve(JSON.stringify(schemaContentJSON));
//                 // } else {
//                 //     try {
//                 //         const componentConfigKey = `${componentMetadata.project.orgId}-${componentMetadata.project.handler}-${componentMetadata.component}`;
//                 //         let componentConfigs: ComponentYamlContent[] | undefined;
//                 //         if (!componentMetadata.isLocalComponent) {
//                 //             componentConfigs = await componentYamlCache.get(componentConfigKey, parseInt(componentMetadata.project.orgId), componentMetadata.project.handler, componentMetadata.component);
//                 //         }
//                 //         const clonedSchema = JSON.parse(JSON.stringify(schemaContentJSON)) as ComponentYamlSchema;
//                 //         const enrichedSchema = enrichComponentSchema(
//                 //             clonedSchema,
//                 //             componentMetadata.component,
//                 //             componentMetadata.project.name,
//                 //             componentConfigs
//                 //         );
//                 //         resolve(JSON.stringify(enrichedSchema));
//                 //     } catch (err) {
//                 //         reject(window.showErrorMessage("Could not register schema"));
//                 //     }
//                 // }
//             });
//         }

//         // Register the schema provider
//         yamlExtensionAPI.registerContributor(SCHEMA, onRequestSchemaURI, onRequestSchemaContent);
//     } catch {
//         window.showErrorMessage("Could not register YAML Language Server");
//         return;
//     }
// }

export function enrichComponentSchema(
	schema: ComponentYamlSchema,
	component: string,
	project: string,
	componentConfigs: ComponentYamlContent[] | undefined,
): ComponentYamlSchema {
	schema.definitions!.name.default = undefined;
	schema.definitions!.projectName.default = undefined;

	schema.definitions!.name.const = component;
	schema.definitions!.projectName.const = project;

	if (!componentConfigs) {
		return schema;
	}
	const branches = new Set<string>();
	componentConfigs.forEach((config) => {
		branches.add(config.spec.build!.branch);
	});

	schema.definitions!.branch.enum = Array.from(branches);

	return schema;
}

interface CacheParams<V, Args extends any[]> {
	readonly expirationTime?: number;
	readonly getDataFunc: (...args: Args) => Promise<V | undefined>;
}

class Cache<V, Args extends any[]> {
	private _timerIndex: Map<string, NodeJS.Timeout>;
	private readonly _expirationTime: number;

	constructor(private params: CacheParams<V, Args>) {
		this._timerIndex = new Map<string, NodeJS.Timeout>();
		this._expirationTime = params.expirationTime ?? 1000 * 60 * 10; // 10 minutes
	}

	private setExpiration(key: string, ...args: Args): void {
		if (this._timerIndex.has(key)) {
			clearTimeout(this._timerIndex.get(key));
		}
		const timer = setTimeout(async () => {
			this._timerIndex.delete(key);
			// await this.invalidate(key, ...args);
		}, this._expirationTime);
		this._timerIndex.set(key, timer);
	}

	public async delete(key: string): Promise<void> {
		await ext.context.globalState.update(key, undefined);
		clearTimeout(this._timerIndex.get(key));
		this._timerIndex.delete(key);
	}

	// public async get(key: string, ...args: Args): Promise<V | undefined> {
	// 	const value = ext.context.globalState.get(key);
	// 	if (value) {
	// 		if (!this._timerIndex.has(key)) {
	// 			this.setExpiration(key, ...args);
	// 		}
	// 		return value as V;
	// 	}
	// 	try {
	// 		const res = await this.params.getDataFunc(...args);
	// 		if (res) {
	// 			await ext.context.globalState.update(key, res);
	// 			this.setExpiration(key, ...args);
	// 			return res;
	// 		}
	// 		return undefined;
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }

	// public async invalidate(key: string, ...args: Args): Promise<void> {
	// 	try {
	// 		const res = await this.params.getDataFunc(...args);
	// 		if (res) {
	// 			await ext.context.globalState.update(key, res);
	// 			this.setExpiration(key, ...args);
	// 		}
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }
}

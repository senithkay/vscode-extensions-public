/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as fs from "fs";
import * as path from "path";
import { Uri, extensions } from "vscode";
import { ext } from "./extensionVariables";
import { getLogger } from "./logger/logger";

const SCHEMA = "choreo";

export async function registerYamlLanguageServer(): Promise<void> {
	try {
		const yamlExtension = extensions.getExtension("redhat.vscode-yaml");
		if (!yamlExtension) {
			return;
		}
		const yamlExtensionAPI = await yamlExtension.activate();

		const schemaBasePath = path.join(ext.context.extensionPath, "yaml-schemas");
		// TODO: add schema for component.yaml
		const schemas = [
			{
				fileName: "component-config.yaml",
				uri: `${SCHEMA}://schema/component-config`,
				schemaPath: path.join(schemaBasePath, "component-config-yaml-schema.json"),
			},
			{
				fileName: "endpoints.yaml",
				uri: `${SCHEMA}://schema/endpoints`,
				schemaPath: path.join(schemaBasePath, "endpoints-yaml-schema.json"),
			},
			{
				fileName: "component.yaml",
				uri: `${SCHEMA}://schema/component`,
				schemaPath: path.join(schemaBasePath, "component-yaml-schema.json"),
			},
		];

		function onRequestSchemaURI(resource: string): string | undefined {
			const matchingSchema = schemas.find((item) => resource.endsWith(`.choreo/${item.fileName}`));
			if (matchingSchema) {
				return matchingSchema.uri;
			}
		}

		function onRequestSchemaContent(schemaUri: string): string | undefined {
			const parsedUri = Uri.parse(schemaUri);
			const matchingSchema = schemas.find((item) => item.uri === schemaUri);
			if (parsedUri.scheme === SCHEMA && matchingSchema) {
				return fs.readFileSync(matchingSchema.schemaPath, "utf-8");
			}
		}

		yamlExtensionAPI.registerContributor(SCHEMA, onRequestSchemaURI, onRequestSchemaContent);
	} catch (err) {
		getLogger().error("Could not register YAML Language Server", err);
	}
}

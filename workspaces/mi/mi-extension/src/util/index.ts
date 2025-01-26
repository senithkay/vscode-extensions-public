/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FileStructure } from '@wso2-enterprise/mi-core';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ExtensionContext, Uri, Webview } from "vscode";
import { getInboundEndpointdXml, GetInboundTemplatesArgs } from './template-engine/mustach-templates/inboundEndpoints';
import { getRegistryResource } from './template-engine/mustach-templates/registryResources';
import { getMessageProcessorXml, MessageProcessorTemplateArgs } from './template-engine/mustach-templates/MessageProcessor';
import { getProxyServiceXml, ProxyServiceTemplateArgs } from './template-engine/mustach-templates/ProxyService';
import { GetTaskTemplatesArgs, getTaskXml } from './template-engine/mustach-templates/tasks';
import { getMessageStoreXml, GetMessageStoreTemplatesArgs } from './template-engine/mustach-templates/messageStore';
import { getEditTemplateXml, getTemplateXml, TemplateArgs } from './template-engine/mustach-templates/Template';
import { getHttpEndpointXml, HttpEndpointArgs } from './template-engine/mustach-templates/HttpEndpoint';
import { getAddressEndpointXml, AddressEndpointArgs } from './template-engine/mustach-templates/AddressEndpoint';
import { getWsdlEndpointXml, WsdlEndpointArgs } from './template-engine/mustach-templates/WsdlEndpoint';
import { getDefaultEndpointXml, DefaultEndpointArgs } from './template-engine/mustach-templates/DefaultEndpoint';
import { GetLoadBalanceEPTemplatesArgs, getLoadBalanceEPXml } from './template-engine/mustach-templates/loadBalanceEndpoint';
import { GetFailoverEPTemplatesArgs, getFailoverEPXml } from './template-engine/mustach-templates/failoverEndpoint';
import { GetRecipientEPTemplatesArgs, getRecipientEPXml } from './template-engine/mustach-templates/recipientEndpoint';
import { GetTemplateEPTemplatesArgs, getTemplateEPXml } from './template-engine/mustach-templates/templateEndpoint';
import { APIResourceArgs, getAPIResourceXml } from './template-engine/mustach-templates/API';
import { getDataServiceXml, getDataSourceXml, DataServiceArgs, Datasource } from './template-engine/mustach-templates/DataService';

const isDevMode = process.env.WEB_VIEW_WATCH_MODE === "true";

export function getComposerJSFiles(context: ExtensionContext, componentName: string, webView: Webview): string[] {
	const filePath = path.join(context.extensionPath, 'resources', 'jslibs', componentName + '.js');
	return [
		isDevMode ? path.join(process.env.WEB_VIEW_DEV_HOST!, componentName + '.js')
			: webView.asWebviewUri(Uri.file(filePath)).toString(),
		isDevMode ? 'http://localhost:8097' : '' // For React Dev Tools
	];
}

export async function createFolderStructure(targetPath: string, structure: FileStructure) {
	for (const [key, value] of Object.entries(structure)) {
		const fullPath = path.join(targetPath, key);

		if (key.includes('.') || key === 'Dockerfile') {
			// If it's a file, create the file
			await fs.promises.writeFile(fullPath, value as string);
		} else {
			// If it's a directory, create the directory and recurse
			await fs.promises.mkdir(fullPath, { recursive: true });
			await createFolderStructure(fullPath, value as FileStructure);
		}
	}
}

export function copyDockerResources(resourcePath: string, targetPath: string) {
	const commonResourcesPath = path.join(targetPath, 'deployment');
	const dockerResourcesPath = path.join(commonResourcesPath, 'docker', 'resources');
	fs.copyFileSync(path.join(resourcePath, 'deployment.toml'), path.join(commonResourcesPath, 'deployment.toml'));
	fs.copyFileSync(path.join(resourcePath, 'client-truststore.jks'), path.join(dockerResourcesPath, 'client-truststore.jks'));
	fs.copyFileSync(path.join(resourcePath, 'wso2carbon.jks'), path.join(dockerResourcesPath, 'wso2carbon.jks'));
}

export function copyMavenWrapper(resourcePath: string, targetPath: string) {
	const mavenWrapperPropertiesPath = path.join(targetPath, '.mvn', 'wrapper');

	fs.mkdirSync(mavenWrapperPropertiesPath, { recursive: true });
	fs.copyFileSync(path.join(resourcePath, 'maven-wrapper.properties'), path.join(mavenWrapperPropertiesPath, 'maven-wrapper.properties'));
	fs.copyFileSync(path.join(resourcePath, 'mvnw.cmd'), path.join(targetPath, 'mvnw.cmd'));
	fs.copyFileSync(path.join(resourcePath, 'mvnw'), path.join(targetPath, 'mvnw'));
}

export function createGitignoreFile(targetPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const gitignorePath = path.join(targetPath, '.gitignore');

		// Common .gitignore patterns
		const gitignoreContent = `
.wso2mi/
##############################
## Java
##############################
.mtj.tmp/
*.class
*.jar
*.war
*.ear
*.nar
hs_err_pid*
replay_pid*

##############################
## Maven
##############################
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
pom.xml.bak
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

##############################
## Visual Studio Code
##############################
.vscode/
.code-workspace

##############################
## OS X
##############################
.DS_Store

##############################
## Miscellaneous
##############################
*.log
		`;

		fs.writeFile(gitignorePath, gitignoreContent, (err) => {
			if (err) {
				reject(err);
				return;
			}
			console.log('.gitignore file created');
			resolve();
		});
	});
}

export function getInboundEndpointXmlWrapper(props: GetInboundTemplatesArgs) {
	return getInboundEndpointdXml(props);
}

export function getRegistryResourceContent(type: string, resourceName: string) {
	return getRegistryResource(type, resourceName);
}

export function getMessageProcessorXmlWrapper(props: MessageProcessorTemplateArgs) {
	return getMessageProcessorXml(props);
}

export function getProxyServiceXmlWrapper(props: ProxyServiceTemplateArgs) {
	return getProxyServiceXml(props);
}

export function getTaskXmlWrapper(data: GetTaskTemplatesArgs) {
	return getTaskXml(data);
}

export function getLoadBalanceXmlWrapper(data: GetLoadBalanceEPTemplatesArgs) {
	return getLoadBalanceEPXml(data);
}

export function getFailoverXmlWrapper(data: GetFailoverEPTemplatesArgs) {
	return getFailoverEPXml(data);
}

export function getRecipientXmlWrapper(data: GetRecipientEPTemplatesArgs) {
	return getRecipientEPXml(data);
}

export function getTemplateEndpointXmlWrapper(data: GetTemplateEPTemplatesArgs) {
	return getTemplateEPXml(data);
}

export function getMessageStoreXmlWrapper(props: GetMessageStoreTemplatesArgs) {
	return getMessageStoreXml(props);
}

export function getTemplateXmlWrapper(props: TemplateArgs) {
	return getTemplateXml(props);
}

export function getEditTemplateXmlWrapper(props: TemplateArgs) {
	return getEditTemplateXml(props);
}

export function getHttpEndpointXmlWrapper(props: HttpEndpointArgs) {
	return getHttpEndpointXml(props);
}

export function getAddressEndpointXmlWrapper(props: AddressEndpointArgs) {
	return getAddressEndpointXml(props);
}

export function getWsdlEndpointXmlWrapper(props: WsdlEndpointArgs) {
	return getWsdlEndpointXml(props);
}

export function getDefaultEndpointXmlWrapper(props: DefaultEndpointArgs) {
	return getDefaultEndpointXml(props);
}

export function getAPIResourceXmlWrapper(props: APIResourceArgs) {
	return getAPIResourceXml(props);
}

export function getDataServiceXmlWrapper(props: DataServiceArgs) {
	return getDataServiceXml(props);
}

export function getDssDataSourceXmlWrapper(props: Datasource) {
	return getDataSourceXml(props);
}

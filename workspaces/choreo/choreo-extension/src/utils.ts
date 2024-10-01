/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as path from "path";
import {
	type ComponentConfigYamlContent,
	type ComponentYamlContent,
	type Endpoint,
	type EndpointYamlContent,
	type ReadLocalEndpointsConfigResp,
	type ReadLocalProxyConfigResp,
	getRandomNumber,
} from "@wso2-enterprise/choreo-core";
import * as yaml from "js-yaml";
import { Uri, commands, window, workspace } from "vscode";
import { getLogger } from "./logger/logger";

export const readLocalEndpointsConfig = (componentPath: string): ReadLocalEndpointsConfigResp => {
	const endpointsYamlPath = join(componentPath, ".choreo", "endpoints.yaml");

	const filterEndpointSchemaPath = (eps: Endpoint[] = []) =>
		eps?.map((item) => {
			if (item.schemaFilePath) {
				const fileExists = existsSync(join(componentPath, item.schemaFilePath));
				return { ...item, schemaFilePath: fileExists ? item.schemaFilePath : "" };
			}
			return item;
		});

	if (existsSync(endpointsYamlPath)) {
		const endpointFileContent: EndpointYamlContent = yaml.load(readFileSync(endpointsYamlPath, "utf8")) as any;
		return {
			endpoints: filterEndpointSchemaPath(endpointFileContent.endpoints),
			filePath: endpointsYamlPath,
		};
	}

	const componentConfigYamlPath = join(componentPath, ".choreo", "component-config.yaml");
	if (existsSync(componentConfigYamlPath)) {
		const endpointFileContent: ComponentConfigYamlContent = yaml.load(readFileSync(componentConfigYamlPath, "utf8")) as any;
		return {
			endpoints: filterEndpointSchemaPath(endpointFileContent?.spec?.inbound),
			filePath: componentConfigYamlPath,
		};
	}

	// TODO: also read from component.yaml and the order should be reversed. read from component.yaml first, then component-config and finally endpoints.yaml
	return { endpoints: [], filePath: "" };
};

export const readLocalProxyConfig = (componentPath: string): ReadLocalProxyConfigResp => {
	const componentYamlPath = join(componentPath, ".choreo", "component.yml");
	if (existsSync(componentYamlPath)) {
		const fileContent: ComponentYamlContent = yaml.load(readFileSync(componentYamlPath, "utf8")) as any;
		return { proxy: fileContent.proxy, filePath: componentYamlPath };
	}
	return { filePath: "" };
};

// TODO: move into ChoreoExtensionApi()
export const goTosource = async (filePath: string, focusFileExplorer?: boolean) => {
	if (existsSync(filePath)) {
		const sourceFile = await workspace.openTextDocument(filePath);
		await window.showTextDocument(sourceFile);
		if (focusFileExplorer) {
			await commands.executeCommand("workbench.explorer.fileView.focus");
		}
	}
};

export const saveFile = async (
	fileName: string,
	fileContent: string,
	baseDirectory: string,
	successMessage?: string,
	isOpenApiFile?: boolean,
	shouldPromptDirSelect?: boolean,
	dialogTitle?: string,
	shouldOpen?: boolean,
) => {
	const dir = baseDirectory;

	const createNewFile = async (basePath: string) => {
		let tempFileName = fileName;
		const baseName = fileName.split(".")[0];
		const extension = fileName.split(".")[1];

		let fileIndex = 1;
		while (existsSync(join(basePath, tempFileName))) {
			tempFileName = `${baseName}-(${fileIndex++}).${extension}`;
			if (fileIndex > 1000) {
				tempFileName = `${baseName}-(${getRandomNumber(1000, 10000)}).${extension}`;
				break;
			}
		}

		const filePath = join(basePath, tempFileName);
		writeFileSync(filePath, fileContent);
		if (shouldOpen) {
			await goTosource(filePath, false);
		}
		const genericSuccessMessage = `A ${fileName} file has been created at ${filePath}`;
		if (isOpenApiFile) {
			window.showInformationMessage(successMessage || genericSuccessMessage, "View File").then((res) => {
				if (res === "View File") {
					goTosource(filePath);
				}
				// todo: handle API design button
			});
		} else {
			window.showInformationMessage(successMessage || genericSuccessMessage, "View File").then((res) => {
				if (res === "View File") {
					goTosource(filePath);
				}
			});
		}
		return filePath;
	};

	if (shouldPromptDirSelect) {
		const result = await window.showOpenDialog({
			title: dialogTitle,
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			defaultUri: Uri.parse(baseDirectory),
		});

		if (result?.[0]) {
			return createNewFile(result?.[0].fsPath);
		}
	} else {
		return createNewFile(baseDirectory);
	}
	return "";
};

export const isSubpath = (parent: string, sub: string): boolean => {
	const normalizedParent = path.normalize(parent).toLowerCase();
	const normalizedSub = path.normalize(sub).toLowerCase();
	if (normalizedParent === normalizedSub) {
		return true;
	}

	const relative = path.relative(normalizedParent, normalizedSub);
	return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
};

export const getSubPath = (subPath: string, parentPath: string): string | null => {
	const normalizedParent = path.normalize(parentPath);
	const normalizedSub = path.normalize(subPath);
	if (normalizedParent === normalizedSub) {
		return ".";
	}

	const relative = path.relative(normalizedParent, normalizedSub);
	// If the relative path starts with '..', it means subPath is outside of parentPath
	if (!relative.startsWith("..")) {
		// If subPath and parentPath are the same, return '.'
		if (relative === "") {
			return ".";
		}
		return relative;
	}
	return null;
};

export const createDirectory = (basePath: string, dirName: string) => {
	let newDirName = dirName;
	let counter = 1;

	// Define the full path for the initial directory
	let dirPath = path.join(basePath, newDirName);

	// Check if the directory exists
	while (existsSync(dirPath)) {
		newDirName = `${dirName}-${counter}`;
		dirPath = path.join(basePath, newDirName);
		counter++;
	}

	// Create the directory
	mkdirSync(dirPath);

	return { dirName: newDirName, dirPath };
};

export async function openDirectory(openingPath: string, message: string) {
	const openInCurrentWorkspace = await window.showInformationMessage(message, { modal: true }, "Current Window", "New Window");
	if (openInCurrentWorkspace === "Current Window") {
		await commands.executeCommand("vscode.openFolder", Uri.file(openingPath), {
			forceNewWindow: false,
		});
		await commands.executeCommand("workbench.explorer.fileView.focus");
	} else if (openInCurrentWorkspace === "New Window") {
		await commands.executeCommand("vscode.openFolder", Uri.file(openingPath), {
			forceNewWindow: true,
		});
	}
}

export function withTimeout<T>(fn: () => Promise<T>, functionName: string, timeout: number): Promise<T> {
	return Promise.race([fn(), new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Function ${functionName} timed out`)), timeout))]);
}

export async function withRetries<T>(fn: () => Promise<T>, functionName: string, retries: number, timeout: number): Promise<T> {
	for (let i = 0; i < retries; i++) {
		try {
			return await withTimeout(fn, functionName, timeout);
		} catch (error: any) {
			if (i === retries - 1) {
				throw error;
			}
			getLogger().error(`Attempt to call ${functionName} failed(Attempt ${i + 1}): ${error?.message}. Retrying...`);
			await delay(500);
		}
	}
	throw new Error(`Max retries reached for function ${functionName}`);
}

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

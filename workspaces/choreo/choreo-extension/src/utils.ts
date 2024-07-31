/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import * as path from "path";
import type { ComponentYamlContent, EndpointYamlContent, ReadEndpointsResp } from "@wso2-enterprise/choreo-core";
import * as yaml from "js-yaml";
import { Uri, commands, window, workspace } from "vscode";
import { getLogger } from "./logger/logger";

export const readEndpoints = (componentPath: string): ReadEndpointsResp => {
	const endpointsYamlPath = join(componentPath, ".choreo", "endpoints.yaml");
	if (existsSync(endpointsYamlPath)) {
		const endpointFileContent: EndpointYamlContent = yaml.load(readFileSync(endpointsYamlPath, "utf8")) as any;
		return { endpoints: endpointFileContent.endpoints, filePath: endpointsYamlPath };
	}

	const componentConfigYamlPath = join(componentPath, ".choreo", "component-config.yaml");
	if (existsSync(componentConfigYamlPath)) {
		const endpointFileContent: ComponentYamlContent = yaml.load(readFileSync(componentConfigYamlPath, "utf8")) as any;
		return { endpoints: endpointFileContent?.spec?.inbound ?? [], filePath: componentConfigYamlPath };
	}
	return { endpoints: [], filePath: "" };
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

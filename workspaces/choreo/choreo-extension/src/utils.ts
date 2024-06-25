/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { EndpointYamlContent, ReadEndpointsResp } from "@wso2-enterprise/choreo-core";
import { existsSync, mkdirSync, readFileSync, unlinkSync, readdirSync, rmdirSync } from "fs";
import * as yaml from "js-yaml";
import { commands, window, workspace } from "vscode";
import { join, dirname } from "path";
import * as path from "path";
import { contextStore } from "./stores/context-store";

// TODO: move into ChoreoExtensionApi()
// export const deleteLinkFile = async (orgHandle: string, projectHandle: string, componentHandle: string) => {
//     const linkFiles = await workspace.findFiles("**/.choreo/link.yaml");
//     for (const linkFile of linkFiles) {
//         const parsedData: LinkFileContent = yaml.load(readFileSync(linkFile.fsPath, "utf8")) as any;
//         if (
//             parsedData.component === componentHandle &&
//             parsedData.project === projectHandle &&
//             parsedData.org === orgHandle
//         ) {
//             unlinkSync(linkFile.fsPath);
//             const choreoDirPath = dirname(linkFile.fsPath);
//             const choreoDirFiles = readdirSync(choreoDirPath);
//             if (choreoDirFiles.length === 0) {
//                 rmdirSync(choreoDirPath);
//             }
//             await contextStore.getState().refreshState();
//             break;
//         }
//     }
// };

export const readEndpoints = (componentPath: string): ReadEndpointsResp => {
    const endpointsYamlPath = join(componentPath, ".choreo", "endpoints.yaml");
    if (existsSync(endpointsYamlPath)) {
        const endpointFileContent: EndpointYamlContent = yaml.load(readFileSync(endpointsYamlPath, "utf8")) as any;
        return { endpoints: endpointFileContent.endpoints, filePath: endpointsYamlPath };
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

// sanitize the component display name to make it url friendly
export function makeURLSafe(input: string): string {
    return input.trim().replace(/\s+/g, "-").toLowerCase();
}

export const isSubpath = (parent: string, sub: string): boolean =>{
    const normalizedParent = path.normalize(parent).toLowerCase();
    const normalizedSub = path.normalize(sub).toLowerCase();
    if (normalizedParent === normalizedSub) {
        return true;
    }

    const relative = path.relative(normalizedParent, normalizedSub);
    return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}


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

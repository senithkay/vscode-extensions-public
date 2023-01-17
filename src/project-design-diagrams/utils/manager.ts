/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { IProjectManager, Project, Component, BallerinaComponentCreationParams } from "@wso2-enterprise/choreo-core";
import { ProgressLocation, window, workspace } from "vscode";
import { randomUUID } from "crypto";
import { readFile, writeFile } from "fs";
import path, { join } from "path";
import { addToWorkspace } from "../../utils/project-utils";
import { runCommand } from "../../testing/runner";

export class BallerinaProjectManager implements IProjectManager {
    createComponent(componentDetails: BallerinaComponentCreationParams): Promise<string> {
        return BallerinaProjectManager._createComponent(componentDetails);
    }

    getProjectDetails(): Promise<Project> {
        throw new Error("ballerina getProjectDetails not implemented.");
    }

    async getProjectRoot(): Promise<string | undefined> {
        const workspaceFolders = workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders?.length > 0) {
            let parentCandidate = path.parse(workspaceFolders[0].uri.fsPath).dir;
            workspaceFolders.forEach((workspaceFolder) => {
                const relative = path.relative(parentCandidate, workspaceFolder.uri.fsPath);
                const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
                if (!isSubdir) {
                    const parsedPath = path.parse(workspaceFolder.uri.fsPath);
                    if (parsedPath.dir !== parentCandidate) {
                        parentCandidate = path.parse(parentCandidate).dir
                    }
                }
            });
            return parentCandidate;
        }
        return undefined;
    }

    private static _createComponent(componentDetails: BallerinaComponentCreationParams): Promise<string> {
        return new Promise((resolve) => {
            const { directory: parentDirPath, package: packageName, name, version, org: orgName } = componentDetails;
            let serviceId: string = "";

            window.withProgress({
                location: ProgressLocation.Window,
                title: "Creating service...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Starting to create the service..." });
                // Run commands spawning a child process
                const res = await runCommand('pwd', parentDirPath, true);
                progress.report({ increment: 10, message: `Opened the workspace folder at ${res}` });
                // Create the package
                await runCommand(`bal new ${packageName} -t service`, parentDirPath);
                progress.report({ increment: 40, message: `Created the package ${packageName} in the workspace folder` });
                const newPkgRootPath = join(join(parentDirPath, packageName), 'Ballerina.toml');
                serviceId = `${name}-${randomUUID()}`;
                // Change toml conf
                readFile(newPkgRootPath, 'utf-8', function (err, contents) {
                    if (err) {
                        progress.report({ increment: 50, message: `"Error while reading toml config " ${err}` });
                        return;
                    }
                    let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = \"${orgName}\"`);
                    replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "${version}"`);
                    writeFile(newPkgRootPath, replaced, 'utf-8', function (err) {
                        progress.report({ increment: 50, message: `Configured toml file successfully` });
                    });
                });
                progress.report({ increment: 60, message: `Configured version ${version} in package ${packageName}` });
                const newServicePath = join(join(parentDirPath, packageName), 'service.bal');
                // Add Display annotation
                readFile(newServicePath, 'utf-8', function (err, contents) {
                    if (err) {
                        progress.report({ increment: 70, message: `"Error while reading service file " ${err}` });
                        return;
                    }
                    const replaced = contents.replace(/service \/ on new http:Listener\(9090\) \{/, `@display {\n\tlabel: "${name}",\n\tid: "${serviceId}"\n}\nservice \/ on new http:Listener(9090) {`);
                    writeFile(newServicePath, replaced, 'utf-8', function (err) {
                        progress.report({ increment: 80, message: `Added service annotation successfully` });
                        return;
                    });
                });
                addToWorkspace(join(parentDirPath, packageName));
                progress.report({ increment: 100, message: `Added the service to the current workspace` });
                return resolve(serviceId);
            });
        });
    }

    getLocalComponents(workspaceFilePath: string): Component[] {
        return []
    }
}

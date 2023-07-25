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

import child_process from "child_process";
import { log } from "console";
import { BYOCRepositoryDetails, ChoreoComponentCreationParams, ComponentDisplayType, WorkspaceComponentMetadata, WorkspaceConfig } from "@wso2-enterprise/choreo-core";
import { basename, dirname, join } from "path";
import { existsSync, mkdirSync, readFile, rmdirSync, unlink, writeFile } from "fs";
import { randomUUID } from "crypto";

export interface CommandResponse {
    error: boolean;
    message: string;
}

const BAL_NEW_PREFIX = "bal new";
const DEFAULT_SERVICE_TEMPLATE_SUFFIX = "-t service";
const GRAPHQL_SERVICE_TEMPLATE_SUFFIX = "-t choreo/graphql_service";

export async function runCommand(cmd: string, cwd?: string): Promise<CommandResponse> {
    return new Promise(function (resolve) {
        child_process.exec(`${cmd}`, { cwd: cwd }, async (err, stdout, stderror) => {
            if (err) {
                log(`error: ${err}`);
                resolve({
                    error: true,
                    message: stderror
                });
            } else {
                resolve({
                    error: false,
                    message: stdout
                });
            }
        });
    });
}

export function getAnnotatedContent(content: string, packageName: string, serviceId: string): string {
    const preText = 'service / on new';
    const processedText = `@display {\n\tlabel: "${packageName}",\n\tid: "${serviceId}"\n}\n${preText}`;
    return content.replace(preText, processedText);
}

export function getBalCommandSuffix(componentType: ComponentDisplayType): string {
    switch (componentType) {
        case ComponentDisplayType.GraphQL:
            return GRAPHQL_SERVICE_TEMPLATE_SUFFIX;
        case ComponentDisplayType.Service:
        case ComponentDisplayType.Proxy:
        case ComponentDisplayType.Webhook:
            return DEFAULT_SERVICE_TEMPLATE_SUFFIX;
        default:
            return '';
    }
}

export function createBallerinaPackage(pkgName: string, pkgRoot: string, componentType: ComponentDisplayType): Promise<CommandResponse> {
    if (!existsSync(pkgRoot)) {
        mkdirSync(pkgRoot, { recursive: true });
    }
    if (existsSync(join(pkgRoot, pkgName))) {
        rmdirSync(join(pkgRoot, pkgName), { recursive: true });
    }
    const cmd = `${BAL_NEW_PREFIX} "${pkgName}" ${getBalCommandSuffix(componentType)}`;
    return runCommand(cmd, pkgRoot);
}

export function processTomlFiles(pkgPath: string, orgName: string) {
    // Remove Dependencies.toml
    const dependenciesTomlPath = join(pkgPath, 'Dependencies.toml');
    if (existsSync(dependenciesTomlPath)) {
        unlink(dependenciesTomlPath, (err) => {
            if (err) {
                log("Error: Could not delete Dependencies.toml.");
            }
        });
    }

    // Update org and version in Ballerina.toml
    const balOrgName = orgName.split(/[^a-zA-Z0-9_]/g).reduce((composedName: string, subname: string) =>
        composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
    const balTomlPath = join(pkgPath, 'Ballerina.toml');
    readFile(balTomlPath, 'utf-8', function (err, contents) {
        if (err) {
            log("Error: Could not read Ballerina.toml.");
            return;
        }
        let replaced = contents.replace(/org = "[a-z,A-Z,0-9,_]+"/, `org = "${balOrgName}"`);
        replaced = replaced.replace(/version = "[0-9].[0-9].[0-9]"/, `version = "1.0.0"`);
        writeFile(balTomlPath, replaced, 'utf-8', (err) => {
            if (err) {
                log("Error: Could not configure Ballerina.toml.");
            }
        });
    });
}

export function addDisplayAnnotation(pkgPath: string, type: ComponentDisplayType) {
    const serviceId = `${basename(pkgPath)}-${randomUUID()}`;
    const serviceFileName = type === ComponentDisplayType.GraphQL ? 'sample.bal' : 'service.bal';
    const serviceFilePath = join(pkgPath, serviceFileName);
    readFile(serviceFilePath, 'utf-8', (err, contents) => {
        if (err) {
            log(`Error: Could not read ${serviceFileName} file.`);
            return;
        }
        const replaced = getAnnotatedContent(contents, basename(pkgPath), serviceId);
        writeFile(serviceFilePath, replaced, 'utf-8', function (err) {
            if (err) {
                log("Error: Could not annotate component.");
            }
        });
    });
}

export function addToWorkspace(workspaceFilePath: string, args: ChoreoComponentCreationParams): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const { org, repositoryInfo, name, displayType, description, projectId, accessibility, webAppConfig, port } = args;

        readFile(workspaceFilePath, 'utf-8', function (err, contents) {
            if (err) {
                reject(new Error("Error: Could not read workspace file."));
            }
            const content: WorkspaceConfig = JSON.parse(contents);
            const metadata: WorkspaceComponentMetadata = {
                org: {
                    id: org.id,
                    handle: org.handle
                },
                displayName: name,
                displayType: displayType,
                description: description,
                projectId: projectId,
                accessibility: accessibility,
                repository: {
                    appSubPath: repositoryInfo.subPath,
                    orgApp: repositoryInfo.org,
                    nameApp: repositoryInfo.repo,
                    branchApp: repositoryInfo.branch,
                    gitProvider: repositoryInfo.gitProvider,
                    bitbucketCredentialId: repositoryInfo.bitbucketCredentialId,
                }
            };
            let componentPath = join('repos', repositoryInfo.org, repositoryInfo.repo);
            if (args.displayType.toString().startsWith("byoc")) {
                const repoInfo = args.repositoryInfo as BYOCRepositoryDetails;
                let srcGitRepoUrl = `https://github.com/${repoInfo.org}/${repoInfo.repo}`;
                if (repositoryInfo.gitProvider === "bitbucket") {
                    srcGitRepoUrl = `https://bitbucket.org/${repoInfo.org}/${repoInfo.repo}`;
                }

                if (args.displayType === ComponentDisplayType.ByocWebAppDockerLess) {
                    metadata.byocWebAppsConfig = {
                        ...webAppConfig,
                        srcGitRepoBranch: repoInfo.branch,
                        srcGitRepoUrl: srcGitRepoUrl,
                    }
                } else {
                    metadata.byocConfig = {
                        dockerfilePath: repoInfo.dockerFile,
                        dockerContext: repoInfo.dockerContext,
                        srcGitRepoBranch: repoInfo.branch,
                        srcGitRepoUrl: srcGitRepoUrl,
                    }
                }

                if (port) {
                    metadata.port = port;
                }

                if (repoInfo.dockerContext) {
                    componentPath = join(componentPath, repoInfo.dockerContext);
                } else if (webAppConfig?.dockerContext) {
                    componentPath = join(componentPath, webAppConfig.dockerContext);
                } else if (webAppConfig?.webAppOutputDirectory) {
                    componentPath = join(componentPath, webAppConfig.webAppOutputDirectory);
                } else {
                    componentPath = dirname(join(componentPath, repoInfo.dockerFile))
                }
            } else {
                componentPath = join(componentPath, repositoryInfo.subPath);
            }

            content.folders.push({
                path: componentPath,
                name: name,
                metadata,
            });

            writeFile(workspaceFilePath, JSON.stringify(content, null, 4), 'utf-8', function (err) {
                if (err) {
                    reject(new Error("Error: Could not add component to project workspace."));
                } else {
                    resolve(true);
                }
            });
        });
    })
}

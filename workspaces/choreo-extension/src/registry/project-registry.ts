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

import { ChoreoServiceComponentType, Component, Organization, Project, serializeError, WorkspaceComponentMetadata } from "@wso2-enterprise/choreo-core";
import { projectClient } from "../auth/auth";
import { ext } from "../extensionVariables";
import { existsSync, rmdirSync } from 'fs';
import { CreateComponentParams } from "@wso2-enterprise/choreo-client";
import { AxiosResponse } from 'axios';
import { dirname, join } from "path";
import * as vscode from 'vscode';
import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { initGit, } from "../git/main";
import { getLogger } from "../logger/logger";
import { ProgressLocation, window } from "vscode";

// Key to store the project locations in the global state
const PROJECT_LOCATIONS = "project-locations";
const PROJECT_REPOSITORIES = "project-repositories";

export class ProjectRegistry {
    static _registry: ProjectRegistry | undefined;
    private _dataProjects: Map<number, Project[]> = new Map<number, Project[]>([]);
    private _dataComponents: Map<string, Component[]> = new Map<string, Component[]>([]);

    constructor() {

    }

    // There will be only one global registry
    static getInstance(): ProjectRegistry {
        if (ProjectRegistry._registry !== undefined) {
            return ProjectRegistry._registry;
        }
        else {
            const registry: ProjectRegistry = new ProjectRegistry();
            ProjectRegistry._registry = registry;
            return registry;
        }
    }

    // When the registry initialised
    init() {
        // Load the persisted data
        // Check if there is a valid user token
        // If so sync the data
        // If the user is offline proceed with the persisted data
        throw new Error(`Method not implemented`);
    }

    async clean(): Promise<void> {
        return new Promise((resolve) => {
            this._dataProjects = new Map<number, Project[]>([]);
            this._dataComponents = new Map<string, Component[]>([]);
            resolve();
        });
    }

    // Adding a refersh method to refresh the data.
    // Currently refresh is handled by clearing the registry
    // and firing refresh on tree view.
    // But tree view refresh API does not support async.
    // Hence there's no way to know when the refresh is completed.
    // We cannot remove tree view refresh either because if we depend
    // on the registry to refresh the tree view, we will end up in a
    // situation where the tree view is stuck until the registry refresh
    // is completed without showing any loader animation.
    // We will use this refresh method from every other places and keep
    // the tree view refresh as it is just to be used for the tree view.
    async refreshProjects(): Promise<Project[] | undefined> {
        await this.clean();
        const selectedOrg = ext.api.selectedOrg;
        if (selectedOrg) {
            return this.getProjects(selectedOrg.id);
        }
    }

    async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        return this.getProjects(orgId).then(async (projects: Project[]) => {
            return projects.find((project: Project) => project.id === projectId);
        });
    }

    async getProjects(orgId: number): Promise<Project[]> {
        if (!this._dataProjects.has(orgId)) {
            return projectClient.getProjects({ orgId: orgId })
                .then((projects) => {
                    this._dataProjects.set(orgId, projects);
                    return projects;
                }).catch((e) => {
                    serializeError(e);
                    return [];
                });
        } else {
            return new Promise((resolve) => {
                const projects: Project[] | undefined = this._dataProjects.get(orgId);
                resolve(projects ? projects : []);
            });
        }
    }

    async getComponents(projectId: string, orgHandle: string, orgUuid: string): Promise<Component[]> {
        try {
            const components = await projectClient.getComponents({ projId: projectId, orgHandle: orgHandle, orgUuid });
            this._dataComponents.set(projectId, components);
            return this._addLocalComponents(projectId, components);
        } catch (e) {
            serializeError(e);
            const components: Component[] | undefined = this._dataComponents.get(projectId);
            return this._addLocalComponents(projectId, components || []);
        }
    }

    async deleteComponent(component: Component, orgHandler: string, projectId: string): Promise<void> {
        try {
            await window.withProgress({
                title: `Deleting component ${component?.name}.`,
                location: ProgressLocation.Notification,
                cancellable: false
            }, async () => {
                let successMsg = "The component has been deleted successfully.";
                if (!component?.local && component.id) {
                    await projectClient.deleteComponent({ component, orgHandler, projectId });
                }

                const projectLocation = this.getProjectLocation(projectId);

                if (component.local) {
                    const choreoPM = new ChoreoProjectManager();
                    if (projectLocation) {
                        const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
                        const componentMetadata = localComponentMeta?.find(item => item.displayName === component.name);
                        if (componentMetadata) {
                            const { orgApp, nameApp, appSubPath } = componentMetadata.repository;
                            const repoPath = join(dirname(projectLocation), "repos", orgApp, nameApp, appSubPath);
                            if (existsSync(repoPath)) {
                                rmdirSync(repoPath, { recursive: true });
                                choreoPM.removeLocalComponent(projectLocation, componentMetadata);
                            }
                        }
                    }
                } else if (!component?.isRemoteOnly && component?.repository) {
                    const { organizationApp, nameApp, appSubPath } = component.repository;
                    if (projectLocation && appSubPath) {
                        const repoPath = join(dirname(projectLocation), "repos", organizationApp, nameApp, appSubPath);
                        if (existsSync(repoPath)) {
                            rmdirSync(repoPath, { recursive: true });
                            successMsg += " Please commit & push your local changes changes to ensure consistency with the remote repository.";
                        }
                    }
                }
                vscode.window.showInformationMessage(successMsg);
            });
        } catch (e) {
            serializeError(e);
        }
    }

    async pullComponent(componentId: string, projectId: string): Promise<void> {
        try {
            const allComponents = this._dataComponents.get(projectId);
            const componentToBePulled = allComponents?.find(item => item.id === componentId);
            const projectLocation = this.getProjectLocation(projectId);

            if (componentToBePulled?.repository && projectLocation) {
                const { organizationApp, nameApp } = componentToBePulled.repository;

                await window.withProgress({
                    title: `Pulling changes from  ${organizationApp}/${nameApp}.`,
                    location: ProgressLocation.Notification,
                    cancellable: false
                }, async () => {
                    const git = await initGit(ext.context);
                    if (git) {
                        const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                        await git.pull(repoPath);
                    } else {
                        getLogger().error("Git was not initialized");
                    }
                });

            }
        } catch (e) {
            serializeError(e);
        }
    }

    async getDiagramModel(projectId: string, orgHandle: string): Promise<Component[]> {
        return projectClient.getDiagramModel({ projId: projectId, orgHandle: orgHandle });
    }

    async getPerformanceForecast(data: string): Promise<AxiosResponse> {
        return projectClient.getPerformanceForecastData(data)
            .then((result: any) => {
                return result;
            }).catch((e: any) => {
                serializeError(e);
                throw (e);
            });
    }

    async getSwaggerExamples(spec: any): Promise<AxiosResponse> {
        return projectClient.getSwaggerExamples(spec)
            .then((result: any) => {
                return result;
            }).catch((e: any) => {
                serializeError(e);
                return false;
            });
    }

    setProjectLocation(projectId: string, location: string) {
        // Project locations are stored in global state
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        // If the locations are not set before create the location map
        if (projectLocations === undefined) {
            projectLocations = {};
        }
        projectLocations[projectId] = location;
        ext.context.globalState.update(PROJECT_LOCATIONS, projectLocations);
    }

    getProjectLocation(projectId: string): string | undefined {
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        const filePath: string | undefined = (projectLocations) ? projectLocations[projectId] : undefined;
        // TODO: check if the location exists 
        if (filePath !== undefined) {
            if (existsSync(filePath)) {
                return filePath;
            } else {
                this._removeLocation(projectId);
            }
        }
        // If not, remove the location from the state
        return undefined;
    }

    setProjectRepository(projectId: string, repository: string) {
        let projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_REPOSITORIES);
        if (projectRepositories === undefined) {
            projectRepositories = {};
        }
        projectRepositories[projectId] = repository;
        ext.context.globalState.update(PROJECT_REPOSITORIES, projectRepositories);
    }

    getProjectRepository(projectId: string): string | undefined {
        const projectRepositories: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_REPOSITORIES);
        return projectRepositories ? projectRepositories[projectId] : undefined;
    }

    pushLocalComponentsToChoreo(projectId: string, org: Organization): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const projectLocation: string | undefined = this.getProjectLocation(projectId);
            let failures: string = "";
            if (projectLocation !== undefined) {
                // Get local components
                const choreoPM = new ChoreoProjectManager();
                const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
                await Promise.all(localComponentMeta.map(async componentMetadata => {
                    try {
                        await this.createComponent(componentMetadata, projectId);
                    } catch {
                        const errorMsg: string = `Failed to push ${componentMetadata.displayName} to Choreo.`;
                        failures = `${failures} ${errorMsg}`;
                        if (componentMetadata.displayType !== ChoreoServiceComponentType.REST_API
                            && componentMetadata.displayType !== ChoreoServiceComponentType.GRAPHQL) {
                            failures = `${failures} Component type is not supported.`;
                        }
                    }
                }));
            }
            if (failures) {
                reject(new Error(failures));
            }
            resolve();
        });
    }

    async pushLocalComponentToChoreo(projectId: string, componentName: string): Promise<void> {
        const choreoPM = new ChoreoProjectManager();
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation !== undefined) {
            const localComponentMeta: WorkspaceComponentMetadata[] = choreoPM.getComponentMetadata(projectLocation);
            const componentMetadata = localComponentMeta?.find(component => component.displayName === componentName);
            if (componentMetadata) {
                try {
                    await this.createComponent(componentMetadata, projectId);
                    vscode.window.showInformationMessage(`The component ${componentMetadata.displayName} has been successfully pushed to Choreo.`);
                } catch (e) {
                    serializeError(e);
                    throw new Error(`Failed to push ${componentMetadata.displayName} to Choreo.`);
                }
            }
        }
    }

    private createComponent = async (componentMetadata: WorkspaceComponentMetadata, projectId: string) => {
        const choreoPM = new ChoreoProjectManager();
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation) {
            const { appSubPath, branchApp, nameApp, orgApp } = componentMetadata.repository;
            const componentRequest: CreateComponentParams = {
                name: componentMetadata.displayName,
                displayName: componentMetadata.displayName,
                displayType: componentMetadata.displayType,
                description: componentMetadata.description,
                orgId: componentMetadata.org.id,
                orgHandle: componentMetadata.org.handle,
                projectId: projectId,
                accessibility: componentMetadata.accessibility,
                srcGitRepoUrl: `https://github.com/${orgApp}/${nameApp}/tree/${branchApp}/${appSubPath}`,
                repositorySubPath: appSubPath,
                repositoryType: "UserManagedNonEmpty",
                repositoryBranch: branchApp
            };
            await projectClient.createComponent(componentRequest);
            choreoPM.removeLocalComponent(projectLocation, componentMetadata);
        }
    };

    async hasDirtyLocalRepo(projectId: string, component: Component): Promise<boolean> {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation && component.repository) {
            const { nameApp, organizationApp, appSubPath } = component.repository;

            const git = await initGit(ext.context);
            if (git) {
                const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                const gitRepo = git.open(repoPath, { path: repoPath });
                const status = await gitRepo.getStatus({ untrackedChanges: 'separate', subDirectory: appSubPath });
                return status.statusLength > 0;
            }
            return false;
        } else {
            return false;
        }
    }

    async hasUnPushedLocalCommit(projectId: string, component: Component): Promise<boolean> {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation && component.repository) {
            const { nameApp, organizationApp, appSubPath } = component.repository;

            const git = await initGit(ext.context);
            if (git) {
                const repoPath = join(dirname(projectLocation), 'repos', organizationApp, nameApp);
                const commits = await git.getUnPushedCommits(repoPath, appSubPath);
                return commits.length > 0;
            }
            return false;
        } else {
            return false;
        }
    }

    public isSubpathAvailable(projectId: string, orgName: string, repoName: string, subPath: string): boolean {
        const projectLocation = this.getProjectLocation(projectId);
        if (projectLocation && orgName && repoName && subPath) {
            const repoPath = join(dirname(projectLocation), "repos", orgName, repoName, subPath);
            return !existsSync(repoPath);
        }
        // TODO Handle subpath check for non cloned repos
        return true;
    }

    private _removeLocation(projectId: string) {
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        // If the locations are not set before create the location map
        if (projectLocations === undefined) {
            projectLocations = {};
        }
        delete projectLocations[projectId];
        ext.context.globalState.update(PROJECT_LOCATIONS, projectLocations);
    }

    private async _addLocalComponents(projectId: string, components: Component[]): Promise<Component[]> {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        components = components.map((component: Component) => {
            if (component.repository?.appSubPath) {
                const { organizationApp, nameApp, appSubPath } = component.repository;
                component.isRemoteOnly = this.isSubpathAvailable(projectId, organizationApp, nameApp, appSubPath);
            }
            return component;
        });
        if (projectLocation !== undefined) {
            const localComponents = (new ChoreoProjectManager()).getLocalComponents(projectLocation);
            components = components.concat(localComponents);
        }
        components = await Promise.all(
            components.map(async (component) => {
                const [hasUnPushedLocalCommits, hasDirtyLocalRepo] = await Promise.all([
                    this.hasUnPushedLocalCommit(projectId, component),
                    this.hasDirtyLocalRepo(projectId, component),
                ]);
                return { ...component, hasUnPushedLocalCommits, hasDirtyLocalRepo };
            })
        );
        return components;
    }
}

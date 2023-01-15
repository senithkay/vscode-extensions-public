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

import { Component, Project, serializeError } from "@wso2-enterprise/choreo-core";
import { projectClient } from "../auth/auth";
import { ext } from "../extensionVariables";
import { existsSync, PathLike } from 'fs';
import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";

// Key to store the project locations in the global state
const PROJECT_LOCATIONS = "project-locations";
const PROJECT_REPOSITORIES = "project-repositories";

export class ProjectRegistry {

    static _registry: ProjectRegistry | undefined;
    private _dataProjects: Map<number, Project[]> = new Map<number, Project[]>([]);
    private _dataComponents: Map<string, Component[]> = new Map<string, Component[]>([]);
    private _dataProjectLocation: Map<string, string> = new Map<string, string>([]);

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

    async sync(): Promise<undefined> {
        return new Promise((resolve) => {
            this._dataProjects = new Map<number, Project[]>([]);
            this._dataComponents = new Map<string, Component[]>([]);
            resolve(undefined);
        });
    }

    async getProject(projectId: string, orgId: number): Promise<Project | undefined> {
        return this.getProjects(orgId).then((projects: Project[]) => {
            return projects.find((project) => { return project.id === projectId; });
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

    async getComponents(projectId: string, orgHandle: string): Promise<Component[]> {
        if (!this._dataComponents.has(projectId)) {
            return projectClient.getComponents({ projId: projectId, orgHandle: orgHandle })
                .then((components) => {
                    this._dataComponents.set(projectId, components);
                    return this._addLocalComponents(projectId, components);
                }).catch((e) => {
                    serializeError(e);
                    return this._addLocalComponents(projectId, []);
                });
        } else {
            return new Promise((resolve) => {
                const components: Component[] | undefined = this._dataComponents.get(projectId);
                resolve(this._addLocalComponents(projectId, components ? components : []));
            });
        }
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

    private _removeLocation(projectId: string) {
        let projectLocations: Record<string, string> | undefined = ext.context.globalState.get(PROJECT_LOCATIONS);
        // If the locations are not set before create the location map
        if (projectLocations === undefined) {
            projectLocations = {};
        }
        delete projectLocations[projectId];
        ext.context.globalState.update(PROJECT_LOCATIONS, projectLocations);
    }

    private _addLocalComponents(projectId: string, components: Component[]): Component[] {
        const projectLocation: string | undefined = this.getProjectLocation(projectId);
        if (projectLocation !== undefined) {
            const localcomponents = (new ChoreoProjectManager()).getLocalComponents(projectLocation);
            components = components.concat(localcomponents);
        }
        return components;
    }
}

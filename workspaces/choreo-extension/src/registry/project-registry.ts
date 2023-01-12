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

    async sync(): Promise<undefined> {
        return new Promise((resolve) => {
            this._dataProjects = new Map<number, Project[]>([]);
            this._dataComponents = new Map<string, Component[]>([]);
            resolve(undefined);
        });
    }

    async getProject(projectId: string, orgId: number) {
        this.getProjects(orgId).then((projects: Project[]) => {
            return projects.find((project) => { project.id === projectId; });
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
                    return components;
                }).catch((e) => {
                    serializeError(e);
                    return [];
                });
        } else {
            return new Promise((resolve) => {
                const components: Component[] | undefined = this._dataComponents.get(projectId);
                resolve(components ? components : []);
            });
        }
    }

    setProjectLocation(projectId: string, dirpath: string) {
        throw new Error(`Method not implemented`);
    }

}
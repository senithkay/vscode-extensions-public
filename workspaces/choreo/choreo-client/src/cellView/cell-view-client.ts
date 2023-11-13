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
import { IChoreoCellViewClient } from "./types";
import { CMService, ComponentType } from "@wso2-enterprise/ballerina-languageclient";
import { workspace } from "vscode";
import { existsSync, readFileSync } from "fs";
import {
    ComponentDisplayType,
    ComponentYamlContent,
    Organization,
    Project,
    ServiceTypes,
    WorkspaceItem
} from "@wso2-enterprise/choreo-core";
import * as path from "path";
import { dirname } from "path";
import { ChoreoProjectClient } from "../project";
import * as yaml from 'js-yaml';
import {
    CHOREO_CONFIG_DIR,
    CHOREO_PROJECT_ROOT,
    COMPONENT_CONFIG_FILE,
    getBuildPackFromFs,
    getComponentDirPath,
    getConnectionModels,
    getDefaultComponentModel,
    getDefaultProjectModel,
    getDefaultServiceModel,
    getGeneralizedComponentType,
    getImplementedLangOrFramework,
    getServiceModels
} from "./utils";

export class ChoreoCellViewClient implements IChoreoCellViewClient {

    constructor(private _projectClient: ChoreoProjectClient) {
    }

    private projects: Project[] = [];
    private projectNameToIdMap: Map<string, string> = new Map();
    private componentHandlerToNameMap: Map<string, string> = new Map();

    async getProjectModelFromFs(organization: Organization, projectId: string) {

        const { id: orgId, name: orgName, handle: orgHandle, uuid: orgUuid } = organization;
        const workspaceFile = workspace.workspaceFile;
        if (!workspaceFile) {
            throw new Error("Workspace file not found");
        }

        const workspaceFileLocation = workspaceFile.fsPath;
        if (!workspaceFileLocation) {
            throw new Error("Workspace file location not found");
        }

        const workspaceContent = JSON.parse(readFileSync(workspaceFileLocation, "utf8"));
        const folders: WorkspaceItem[] = workspaceContent.folders;

        const project = (await this.getProjects(orgId, orgHandle)).find(project => project.id === projectId);
        if (!project) {
            throw new Error(`Project with id ${projectId} not found under organization ${organization.name}`);
        }

        const projectModel = getDefaultProjectModel(projectId, project.name);

        for (const folder of folders) {
            if (folder.name === CHOREO_PROJECT_ROOT && folder.path === ".") {
                continue;
            }

            const componentPath = path.join(dirname(workspaceFileLocation), folder.path);
            const choreoDirPath = path.join(componentPath, CHOREO_CONFIG_DIR);
            const componentYamlPath = path.join(choreoDirPath, COMPONENT_CONFIG_FILE);
            
            if (existsSync(componentYamlPath)) {
                const componentYamlContent = yaml.load(readFileSync(componentYamlPath, "utf8")) as ComponentYamlContent;
                const componentName = componentYamlContent.metadata.name;
                const componentTypeAnnotation = componentYamlContent.metadata.annotations?.componentType;
                const componentType = componentTypeAnnotation ? componentTypeAnnotation as ComponentType : ComponentType.SERVICE;
                const buildPack = getBuildPackFromFs(componentPath);
                const defaultComponentModel = getDefaultComponentModel(orgName, componentName, componentType, buildPack);

                if (componentType === ComponentType.SERVICE) {
                    const endpoints = componentYamlContent.spec.inbound || []
                    const connections = componentYamlContent.spec.outbound;

                    const serviceModels = getServiceModels(endpoints, orgName, projectId, componentName,
                        folder.path, componentYamlPath);
                    const servicesRecord: Record<string, CMService> = {};
                    serviceModels.forEach(service => {
                        servicesRecord[service.id] = service;
                    });

                    defaultComponentModel.services = servicesRecord as any;

                    const projectNameToIdMap = await this.getProjectHandlerToIdMap(orgId, orgHandle);
                    const compHandlerToNameMap = await this.getComponentHandlerToNameMap(orgId, projectId, orgHandle, orgUuid);
                    defaultComponentModel.connections = connections
                        ? getConnectionModels(connections, projectNameToIdMap, compHandlerToNameMap)
                        : [];
                } else if (componentType === ComponentType.WEB_APP) {
                    const service: CMService = {
                        ...getDefaultServiceModel(),
                        type: ServiceTypes.WEBAPP,
                        deploymentMetadata: {
                            gateways: {
                                internet: { isExposed: true },
                                intranet: { isExposed: false }
                            }
                        },
                    };
                    defaultComponentModel.services = {[componentName]: service} as any;
                } else if (componentType === ComponentType.MANUAL_TASK || componentType === ComponentType.SCHEDULED_TASK) {
                    defaultComponentModel.functionEntryPoint = {
                        id: 'main',
                        label: componentName,
                        annotation: { id: componentName, label: "" },
                        type: componentType === ComponentType.MANUAL_TASK ? "manualTrigger" : "scheduledTask",
                        dependencies: [],
                        interactions: [],
                        parameters: [],
                        returns: []
                    }
                }

                projectModel.components.push(defaultComponentModel);
            } else {
                console.warn(`${COMPONENT_CONFIG_FILE} not found in ${choreoDirPath}`);
            }
            
        }

        return projectModel;
    }

    async getProjectModelFromChoreo(organization: Organization, projectId: string) {

        const { id: orgId, name: orgName, handle: orgHandle, uuid: orgUuid } = organization;
        const workspaceFile = workspace.workspaceFile;
        if (!workspaceFile) {
            throw new Error("Workspace file not found");
        }

        const workspaceFileLocation = workspaceFile.fsPath;
        if (!workspaceFileLocation) {
            throw new Error("Workspace file location not found");
        }

        const project = (await this.getProjects(orgId, orgHandle)).find(project => project.id === projectId);
        if (!project) {
            throw new Error(`Project with id ${projectId} not found under organization ${organization.name}`);
        }

        const projectModel = getDefaultProjectModel(projectId, project.name);

        const choreoComponents = await this._projectClient.getComponents(
            {projId: projectId, orgId, orgHandle, orgUuid}
        );

        for (const component of choreoComponents) {
            const displayType = component.displayType as ComponentDisplayType;
            const buildPack = getImplementedLangOrFramework(component);
            const componentType = getGeneralizedComponentType(displayType);
            const defaultComponentModel = getDefaultComponentModel(orgName, component.name,
                componentType, buildPack, component.version);
            const componentPath = getComponentDirPath(component, workspaceFileLocation);

            if (!componentPath) {
                throw new Error(`Component path not found for component ${component.name}`);
            }

            if (componentType === ComponentType.SERVICE) {
                const componentYamlPath = path.join(componentPath, CHOREO_CONFIG_DIR, COMPONENT_CONFIG_FILE);

                if (existsSync(componentYamlPath)) {
                    const componentYamlContent = yaml.load(readFileSync(componentYamlPath, "utf8")) as ComponentYamlContent;
                    const endpoints = componentYamlContent.spec.inbound || []
                    const connections = componentYamlContent.spec.outbound;

                    const serviceModels = getServiceModels(endpoints, orgName, projectId, component.name,
                        componentPath, componentYamlPath);
                    const servicesRecord: Record<string, CMService> = {};
                    serviceModels.forEach(service => {
                        servicesRecord[service.id] = service;
                    });

                    defaultComponentModel.services = servicesRecord as any;

                    const projectNameToIdMap = await this.getProjectHandlerToIdMap(orgId, orgHandle);
                    const compHandlerToNameMap = await this.getComponentHandlerToNameMap(orgId, projectId, orgHandle, orgUuid);
                    defaultComponentModel.connections = connections
                        ? getConnectionModels(connections, projectNameToIdMap, compHandlerToNameMap)
                        : [];
                }
            } else if (componentType === ComponentType.WEB_APP) {
                const service: CMService = {
                    ...getDefaultServiceModel(),
                    type: ServiceTypes.WEBAPP,
                    deploymentMetadata: {
                        gateways: {
                            internet: { isExposed: true },
                            intranet: { isExposed: false }
                        }
                    },
                };
                defaultComponentModel.services = {[component.name]: service} as any;
            } else if (componentType === ComponentType.MANUAL_TASK || componentType === ComponentType.SCHEDULED_TASK) {
                defaultComponentModel.functionEntryPoint = {
                    id: 'main',
                    label: component.name,
                    annotation: { id: component.name, label: "" },
                    type: component.displayType === ComponentDisplayType.ByocJob ? "manualTrigger" : "scheduledTask",
                    dependencies: [],
                    interactions: [],
                    parameters: [],
                    returns: []
                }
            }
            projectModel.components.push(defaultComponentModel);
        }

        return projectModel;
    }

    async getProjects(orgId: number, orgHandle: string) {
        if (this.projects.length === 0) {
            this.projects = await this._projectClient.getProjects({orgId, orgHandle});
        }
        return this.projects;
    }

    async getProjectHandlerToIdMap(orgId: number, orgHandle: string) {
        if (this.projectNameToIdMap.size === 0) {
            const projects = await this.getProjects(orgId, orgHandle);
            projects.forEach(project => {
                this.projectNameToIdMap.set(project.handler, project.id);
            });
        }
        return this.projectNameToIdMap;
    }

    async getComponentHandlerToNameMap(orgId: number, projectId: string, orgHandle: string, orgUuid: string) {
        if (this.componentHandlerToNameMap.size === 0) {
            const components = await this._projectClient.getComponents(
                {projId: projectId, orgId, orgHandle, orgUuid}
            );
            components.forEach(component => {
                this.componentHandlerToNameMap.set(component.handler, component.name);
            });
        }
        return this.componentHandlerToNameMap;
    }
}

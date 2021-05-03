/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { BallerinaExtension, DocumentIdentifier, ExtendedLangClient } from 'src/core';
import {
    Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace
} from 'vscode';
import { Module, PackageTreeItem, Package, ChildrenData, CMP_KIND } from './model';
import { join, sep } from 'path';
import fileUriToPath = require('file-uri-to-path');
import { PROJECT_TYPE } from '../project/cli-cmds/cmd-runner';

const BAL_TOML = "Ballerina.toml";
const BALLERINA = "ballerina";

/**
 * Data provider class for package tree.
 */
export class PackageOverviewDataProvider implements TreeDataProvider<PackageTreeItem> {
    private langClient?: ExtendedLangClient;
    private ballerinaExtension: BallerinaExtension;
    private extensionPath: string;

    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
        this.langClient = ballerinaExtension.langClient;
        this.extensionPath = ballerinaExtension.extension.extensionPath;
        workspace.onDidOpenTextDocument(document => {
            if (document.languageId === BALLERINA || document.fileName.endsWith(BAL_TOML)) {
                this.refresh();
            }
        });
        workspace.onDidChangeTextDocument(activatedTextEditor => {
            if (activatedTextEditor && activatedTextEditor.document.languageId === BALLERINA ||
                activatedTextEditor.document.fileName.endsWith(BAL_TOML)) {
                this.refresh();
            }
        });
    }
    private _onDidChangeTreeData: EventEmitter<PackageTreeItem | undefined> = new EventEmitter<PackageTreeItem | undefined>();
    readonly onDidChangeTreeData: Event<PackageTreeItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: PackageTreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getParent?(element: PackageTreeItem): ProviderResult<PackageTreeItem> {
        return element.getParent();
    }

    getChildren(element?: PackageTreeItem): ProviderResult<PackageTreeItem[]> {
        if (!this.ballerinaExtension.isSwanLake) {
            window.showErrorMessage("Ballerina package overview is only supported in Swan Lake.");
            return;
        }
        if (!element) {
            return this.getPackageStructure();
        } else if (element.getKind() === CMP_KIND.PACKAGE) {
            return this.getModuleStructure(element);
        } else if (element.getKind() === CMP_KIND.MODULE) {
            return this.getComponentStructure(element);
        } else if (element.getKind() === CMP_KIND.SERVICE) {
            return this.getResourceStructure(element);
        }
    }

    /**
     * Returns the tree structure for packages.
     * @returns An array of tree nodes with package data.
     */
    public getPackageStructure(): Promise<PackageTreeItem[]> {
        return new Promise<PackageTreeItem[]>((resolve) => {
            if (!window.activeTextEditor) {
                resolve([]);
            }
            const activeDocument = window.activeTextEditor!.document;
            this.ballerinaExtension.onReady().then(() => {
                this.langClient!.getBallerinaProject({
                    documentIdentifier: {
                        uri: activeDocument.uri.toString()
                    }
                }).then(project => {
                    const uri: string = activeDocument.fileName.endsWith(BAL_TOML) ?
                        activeDocument.uri.toString(true).replace(BAL_TOML, '') : activeDocument.uri.toString(true);
                    const documentIdentifiers: DocumentIdentifier[] = [{ uri }];
                    if (project.kind === PROJECT_TYPE.BUILD_PROJECT || project.kind === PROJECT_TYPE.SINGLE_FILE) {
                        this.langClient!.getBallerinaProjectComponents({ documentIdentifiers }).then((response) => {
                            if (response.packages) {
                                const projectItems: PackageTreeItem[] = this.createPackageData(response.packages,
                                    project.kind === PROJECT_TYPE.SINGLE_FILE);
                                resolve(projectItems);
                            } else {
                                resolve([]);
                            }
                        });
                    } else {
                        resolve([]);
                    }
                });
            }).catch(() => {
                resolve([]);
            });
        });
    }

    /**
     * Returns the tree structure for functions and services.
     * @returns An array of tree nodes with module component data.
     */
    private getComponentStructure(parent: PackageTreeItem, isDefaultModule: boolean = false,
        childrenData: ChildrenData = {}): PackageTreeItem[] {
        let components: PackageTreeItem[] = [];
        const children: ChildrenData = isDefaultModule ? childrenData : parent.getChildrenData();
        //Process function nodes
        if (children.functions) {
            const functionNodes = children.functions;
            functionNodes.sort((fn1, fn2) => {
                return fn1.name!.localeCompare(fn2.name!);
            });
            functionNodes.forEach(fn => {
                components.push(new PackageTreeItem(fn.name, `${fn.filePath}`, TreeItemCollapsibleState.None,
                    CMP_KIND.FUNCTION, parent.getIsSingleFile() ? parent.getFilePath() : join(parent.getFilePath(),
                        fn.filePath), this.extensionPath, true, parent, {}, fn.startLine, fn.startColumn));
            });
        }

        //Process service nodes
        if (children.services) {
            const serviceNodes = children.services.filter(service => {
                return service.name;
            });
            serviceNodes.sort((service1, service2) => {
                return service1.name!.localeCompare(service2.name!);
            });
            serviceNodes.forEach(service => {
                components.push(new PackageTreeItem(service.name, `${service.filePath}`,
                    TreeItemCollapsibleState.Collapsed, CMP_KIND.SERVICE, parent.getIsSingleFile() ?
                    parent.getFilePath() : join(parent.getFilePath(), service.filePath), this.extensionPath, true,
                    parent, { resources: service.resources }, service.startLine, service.startColumn));
            });

            const serviceNodesWithoutName = children.services.filter(service => {
                return !service.name;
            });
            let count: number = 0;
            serviceNodesWithoutName.forEach(service => {
                components.push(new PackageTreeItem(`${CMP_KIND.SERVICE} ${++count}`, `${service.filePath}`,
                    TreeItemCollapsibleState.Collapsed, CMP_KIND.SERVICE, parent.getIsSingleFile() ?
                    parent.getFilePath() : join(parent.getFilePath(), service.filePath), this.extensionPath, true,
                    parent, { resources: service.resources }, service.startLine, service.startColumn));
            });
        }
        return components;
    }

    private createPackageData(packages: Package[], isSingleFile: boolean): PackageTreeItem[] {
        let packageItems: PackageTreeItem[] = [];
        packages.sort((package1, package2) => {
            return package1.name.localeCompare(package2.name!);
        });
        packages.forEach(projectPackage => {
            projectPackage.name = projectPackage.name === '.' ? window.activeTextEditor!.document.fileName
                .replace('.bal', '').split(sep).pop()!.toString() : projectPackage.name;
            if (projectPackage.name) {
                packageItems.push(new PackageTreeItem(projectPackage.name, '',
                    TreeItemCollapsibleState.Expanded, CMP_KIND.PACKAGE, fileUriToPath(projectPackage.filePath),
                    this.extensionPath, true, null, { modules: projectPackage.modules }, -1, -1, isSingleFile));
            }
        });
        return packageItems;
    }

    /**
     * Returns the tree structure for modules.
     * @returns An array of tree nodes with module data.
     */
    private getModuleStructure(parent: PackageTreeItem): PackageTreeItem[] {
        let moduleItems: PackageTreeItem[] = [];
        if (parent.getChildrenData().modules) {
            const defaultModules: Module[] = parent.getChildrenData().modules!.filter(module => {
                return !module.name;
            });
            if (defaultModules.length === 1) {
                const defaultModuleItems: PackageTreeItem[] = this.getComponentStructure(parent, true,
                    { functions: defaultModules[0].functions, services: defaultModules[0].services });
                if (defaultModuleItems.length > 0) {
                    moduleItems = moduleItems.concat(defaultModuleItems);
                }
            }

            const nonDefaultModules: Module[] = parent.getChildrenData().modules!.filter(module => {
                return module.name;
            });
            nonDefaultModules.sort((mod1, mod2) => {
                return mod1.name!.localeCompare(mod2.name!);
            });
            nonDefaultModules.forEach(module => {
                moduleItems.push(new PackageTreeItem(module.name!, '',
                    TreeItemCollapsibleState.Collapsed, CMP_KIND.MODULE, join(parent.getFilePath(), 'modules',
                        module.name!), this.extensionPath, false, parent,
                    {
                        functions: module.functions,
                        services: module.services
                    }));
            });
        }
        return moduleItems;
    }

    /**
      * Returns the tree structure for resources.
      * @returns An array of tree nodes with resource data.
      */
    private getResourceStructure(parent: PackageTreeItem): PackageTreeItem[] {
        let resources: PackageTreeItem[] = [];
        const children: ChildrenData = parent.getChildrenData();
        if (children.resources) {
            const resourceNodes = children.resources;
            resourceNodes.sort((resource1, resource2) => {
                return resource1.name!.localeCompare(resource2.name!);
            });
            resourceNodes.forEach(resource => {
                resources.push(new PackageTreeItem(resource.name, '',
                    TreeItemCollapsibleState.None, CMP_KIND.RESOURCE, parent.getFilePath(), this.extensionPath, true,
                    parent, {}, resource.startLine, resource.startColumn));
            });
        }
        return resources;
    }
}

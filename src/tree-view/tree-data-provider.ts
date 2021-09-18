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

import { BallerinaExtension, DocumentIdentifier, ExtendedLangClient, LANGUAGE } from '../core';
import {
    Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, window, workspace
} from 'vscode';
import { Module, PackageTreeItem, Package, ChildrenData, CMP_KIND, Leaf } from './model';
import { join, sep } from 'path';
import fileUriToPath from 'file-uri-to-path';
import { BAL_TOML, PROJECT_TYPE } from '../project';
import { DiagramOptions } from '../diagram';
import { isSupportedVersion, VERSION } from '../utils';

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
            if (document.languageId === LANGUAGE.BALLERINA || document.fileName.endsWith(BAL_TOML)) {
                this.ballerinaExtension.setCurrentDocument(document);
                this.refresh();
            }
        });
        workspace.onDidChangeTextDocument(activatedTextEditor => {
            if (activatedTextEditor && activatedTextEditor.document.languageId === LANGUAGE.BALLERINA ||
                activatedTextEditor.document.fileName.endsWith(BAL_TOML)) {
                this.ballerinaExtension.setCurrentDocument(activatedTextEditor.document);
                this.refresh();
            }
        });
    }
    private _onDidChangeTreeData: EventEmitter<PackageTreeItem | undefined> = new EventEmitter<PackageTreeItem
        | undefined>();
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
        if (!this.ballerinaExtension.isSwanLake() || !isSupportedVersion(this.ballerinaExtension, VERSION.BETA, 1)) {
            window.showErrorMessage("Ballerina package overview is not supported in this Ballerina runtime version.");
            return;
        }
        if (!element) {
            return this.getPackageStructure();
        } else if (element.getKind() === CMP_KIND.DEFAULT_MODULE || element.getKind() === CMP_KIND.MODULE) {
            return this.getComponentLabels(element);
        } else if (element.getKind() === CMP_KIND.FUNCTION_LABEL || element.getKind() === CMP_KIND.SERVICE_LABEL
            || element.getKind() === CMP_KIND.RECORD_LABEL || element.getKind() === CMP_KIND.OBJECT_LABEL ||
            element.getKind() === CMP_KIND.TYPE_LABEL || element.getKind() === CMP_KIND.CONSTANT_LABEL ||
            element.getKind() === CMP_KIND.ENUM_LABEL || element.getKind() === CMP_KIND.CLASS_LABEL ||
            element.getKind() === CMP_KIND.LISTENER_LABEL || element.getKind() === CMP_KIND.MODULE_LEVEL_VAR_LABEL) {
            return this.getComponentStructure(element);
        } else if (element.getKind() === CMP_KIND.SERVICE || element.getKind() === CMP_KIND.CLASS) {
            return this.getResourceStructure(element);
        }
    }

    /**
     * Returns the tree structure for packages.
     * @returns An array of tree nodes with package data.
     */
    public getPackageStructure(): Promise<PackageTreeItem[]> {
        return new Promise<PackageTreeItem[]>((resolve) => {
            const activeDocument = window.activeTextEditor ? window.activeTextEditor!.document :
                this.ballerinaExtension.getCurrentDocument();
            if (!activeDocument) {
                resolve([]);
            }
            this.ballerinaExtension.onReady().then(() => {
                this.langClient!.getBallerinaProject({
                    documentIdentifier: {
                        uri: activeDocument!.uri.toString()
                    }
                }).then(project => {
                    const documentIdentifiers: DocumentIdentifier[] = [{ uri: activeDocument!.uri.toString(true) }];
                    if (project.kind === PROJECT_TYPE.BUILD_PROJECT || project.kind === PROJECT_TYPE.SINGLE_FILE) {
                        this.langClient!.getBallerinaProjectComponents({ documentIdentifiers }).then((response) => {
                            if (response.packages) {
                                const projectItems: PackageTreeItem[] = this.createPackageData(response.packages[0],
                                    project.kind === PROJECT_TYPE.SINGLE_FILE, activeDocument!.fileName);
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

    private getComponentLabels(parent: PackageTreeItem): PackageTreeItem[] {
        let components: PackageTreeItem[] = [];
        const children: ChildrenData = parent.getChildrenData();

        this.addComponentLabel(children.functions, components, 'Functions', parent, CMP_KIND.FUNCTION_LABEL);
        this.addComponentLabel(children.services, components, 'Services', parent, CMP_KIND.SERVICE_LABEL);// TODO add command
        this.addComponentLabel(children.records, components, 'Records', parent, CMP_KIND.RECORD_LABEL);
        this.addComponentLabel(children.objects, components, 'Objects', parent, CMP_KIND.OBJECT_LABEL);
        this.addComponentLabel(children.types, components, 'Types', parent, CMP_KIND.TYPE_LABEL);
        this.addComponentLabel(children.constants, components, 'Constants', parent, CMP_KIND.CONSTANT_LABEL);
        this.addComponentLabel(children.enums, components, 'Enums', parent, CMP_KIND.ENUM_LABEL);
        this.addComponentLabel(children.classes, components, 'Classes', parent, CMP_KIND.CLASS_LABEL);// TODO add command
        this.addComponentLabel(children.listeners, components, 'Listeners', parent, CMP_KIND.LISTENER_LABEL);
        this.addComponentLabel(children.moduleVariables, components, 'Module Level Variables', parent,
            CMP_KIND.MODULE_LEVEL_VAR_LABEL);
        return components;
    }

    private addComponentLabel(leaves: Leaf[] | undefined, components: PackageTreeItem[], label: string,
        parent: PackageTreeItem, kind: CMP_KIND) {
        if (leaves && leaves.length > 0) {
            components.push(new PackageTreeItem(label, '', TreeItemCollapsibleState.Collapsed, kind,
                parent.getFilePath(), this.extensionPath, false, parent, parent.getChildrenData(), -1, -1,
                parent.getIsSingleFile()));
        }
    }

    /**
     * Returns the tree structure for functions and services.
     * @returns An array of tree nodes with module component data.
     */
    private getComponentStructure(parent: PackageTreeItem): PackageTreeItem[] {
        let components: PackageTreeItem[] = [];
        const children: ChildrenData = parent.getChildrenData();

        if (parent.getKind() === CMP_KIND.FUNCTION_LABEL) {
            if (parent.getParent()!.getKind() === CMP_KIND.DEFAULT_MODULE && children.functions) {
                const mainFunctionNodes = children.functions.filter(fn => {
                    return fn.name === 'main';
                });
                if (mainFunctionNodes.length > 0) {
                    mainFunctionNodes.forEach(fn => {
                        components.push(new PackageTreeItem(fn.name, `${fn.filePath}`, TreeItemCollapsibleState.None,
                            CMP_KIND.MAIN_FUNCTION, parent.getIsSingleFile() ? parent.getFilePath() :
                            join(parent.getFilePath(), fn.filePath), this.extensionPath, true, parent, {}, fn.startLine,
                            fn.startColumn));
                    });
                }
            }

            //Process function nodes
            let functionNodes = children.functions!;
            if (parent.getParent()!.getKind() === CMP_KIND.DEFAULT_MODULE) {
                functionNodes = functionNodes.filter(fn => {
                    return fn.name !== 'main';
                });
            }
            functionNodes.sort((fn1, fn2) => {
                return fn1.name!.localeCompare(fn2.name!);
            });
            functionNodes.forEach(fn => {
                components.push(new PackageTreeItem(fn.name, `${fn.filePath}`, TreeItemCollapsibleState.None,
                    CMP_KIND.FUNCTION, parent.getIsSingleFile() ? parent.getFilePath() : join(parent.getFilePath(),
                        fn.filePath), this.extensionPath, true, parent, {}, fn.startLine, fn.startColumn));
            });
        }

        this.addLeafNodes(children.records!, components, parent, CMP_KIND.RECORD_LABEL, CMP_KIND.RECORD);
        this.addLeafNodes(children.objects!, components, parent, CMP_KIND.OBJECT_LABEL, CMP_KIND.OBJECT);
        this.addLeafNodes(children.types!, components, parent, CMP_KIND.TYPE_LABEL, CMP_KIND.TYPE);
        this.addLeafNodes(children.constants!, components, parent, CMP_KIND.CONSTANT_LABEL, CMP_KIND.CONSTANT);
        this.addLeafNodes(children.enums!, components, parent, CMP_KIND.ENUM_LABEL, CMP_KIND.ENUM);
        this.addLeafNodes(children.listeners!, components, parent, CMP_KIND.LISTENER_LABEL, CMP_KIND.LISTENER);
        this.addLeafNodes(children.moduleVariables!, components, parent, CMP_KIND.MODULE_LEVEL_VAR_LABEL,
            CMP_KIND.MODULE_LEVEL_VAR);

        if (parent.getKind() == CMP_KIND.CLASS_LABEL) {
            const classes = children.classes!;
            classes.sort((c1, c2) => {
                return c1.name!.localeCompare(c2.name!);
            });
            classes.forEach(c => {
                components.push(new PackageTreeItem(c.name, `${c.filePath}`, TreeItemCollapsibleState.Expanded,
                    CMP_KIND.CLASS, parent.getIsSingleFile() ? parent.getFilePath() : join(parent.getFilePath(),
                        c.filePath), this.extensionPath, true, parent, { methods: c.functions }, c.startLine,
                    c.startColumn));
            });
        }

        if (parent.getKind() === CMP_KIND.SERVICE_LABEL) {
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
                        TreeItemCollapsibleState.Expanded, CMP_KIND.SERVICE, parent.getIsSingleFile() ?
                        parent.getFilePath() : join(parent.getFilePath(), service.filePath), this.extensionPath, true,
                        parent, { resources: service.resources }, service.startLine, service.startColumn));
                });

                const serviceNodesWithoutName = children.services.filter(service => {
                    return !service.name;
                });
                let count: number = 0;
                serviceNodesWithoutName.forEach(service => {
                    components.push(new PackageTreeItem(`${CMP_KIND.SERVICE} ${++count}`, `${service.filePath}`,
                        TreeItemCollapsibleState.Expanded, CMP_KIND.SERVICE, parent.getIsSingleFile() ?
                        parent.getFilePath() : join(parent.getFilePath(), service.filePath), this.extensionPath, true,
                        parent, { resources: service.resources }, service.startLine, service.startColumn));
                });
            }
        }


        return components;
    }

    private addLeafNodes(leaves: Leaf[], components: PackageTreeItem[], parent: PackageTreeItem, kind: CMP_KIND, leafKind: CMP_KIND) {
        if (parent.getKind() !== kind) {
            return;
        }
        leaves.sort((l1, l2) => {
            return l1.name!.localeCompare(l2.name!);
        });
        leaves.forEach(l => {
            components.push(new PackageTreeItem(l.name, `${l.filePath}`, TreeItemCollapsibleState.None,
                leafKind, parent.getIsSingleFile() ? parent.getFilePath() : join(parent.getFilePath(),
                    l.filePath), this.extensionPath, true, parent, {}, l.startLine, l.startColumn));
        });
    }

    private createPackageData(projectPackage: Package, isSingleFile: boolean, documentName: string):
        PackageTreeItem[] {
        let moduleItems: PackageTreeItem[] = [];
        if (!window.activeTextEditor && documentName === '') {
            return moduleItems;
        }
        documentName = documentName !== '' ? documentName : window.activeTextEditor!.document.fileName;
        projectPackage.name = projectPackage.name === '.' ?
            documentName.replace('.bal', '').split(sep).pop()!.toString() : projectPackage.name;
        if (projectPackage.name) {
            moduleItems.push(new PackageTreeItem(projectPackage.name, '',
                TreeItemCollapsibleState.Expanded, CMP_KIND.DEFAULT_MODULE, fileUriToPath(projectPackage.filePath),
                this.extensionPath, true, null, {}, -1, -1, isSingleFile));
            this.getModuleStructure(moduleItems[0], moduleItems, projectPackage.modules);
        }
        return moduleItems;
    }

    /**
     * Sets the tree structure for modules.
     */
    private getModuleStructure(parent: PackageTreeItem, moduleItems: PackageTreeItem[], modules: Module[]) {
        if (modules) {
            const defaultModules: Module[] = modules.filter(module => {
                return !module.name;
            });
            if (defaultModules.length === 1) {
                parent.setChildrenData({
                    functions: defaultModules[0].functions, services: defaultModules[0].services,
                    objects: defaultModules[0].objects, records: defaultModules[0].records,
                    constants: defaultModules[0].constants, types: defaultModules[0].types,
                    enums: defaultModules[0].enums, classes: defaultModules[0].classes,
                    listeners: defaultModules[0].listeners, moduleVariables: defaultModules[0].moduleVariables
                });
            }

            const nonDefaultModules: Module[] = modules.filter(module => {
                return module.name;
            });
            nonDefaultModules.sort((mod1, mod2) => {
                return mod1.name!.localeCompare(mod2.name!);
            });
            nonDefaultModules.forEach(module => {
                moduleItems.push(new PackageTreeItem(`${parent.getName()}.${module.name!}`, '',
                    TreeItemCollapsibleState.Expanded, CMP_KIND.MODULE, join(parent.getFilePath(), 'modules',
                        module.name!), this.extensionPath, true, parent,
                    {
                        functions: module.functions,
                        services: module.services,
                        objects: module.objects,
                        records: module.records,
                        constants: module.constants,
                        types: module.types,
                        enums: module.enums,
                        classes: module.classes,
                        listeners: module.listeners,
                        moduleVariables: module.moduleVariables
                    }));
            });
        }
    }

    /**
      * Returns the tree structure for resources.
      * @returns An array of tree nodes with resource data.
      */
    private getResourceStructure(parent: PackageTreeItem): PackageTreeItem[] {
        let leafNodes: PackageTreeItem[] = [];
        const children: ChildrenData = parent.getChildrenData();
        if (parent.getKind() == CMP_KIND.SERVICE && children.resources) {
            const resourceNodes = children.resources;
            resourceNodes.sort((resource1, resource2) => {
                return resource1.name!.localeCompare(resource2.name!);
            });
            resourceNodes.forEach(resource => {
                leafNodes.push(new PackageTreeItem(resource.name, '',
                    TreeItemCollapsibleState.None, CMP_KIND.RESOURCE, parent.getFilePath(), this.extensionPath, true,
                    parent, {}, resource.startLine, resource.startColumn));
            });
        }
        if (parent.getKind() == CMP_KIND.CLASS && children.methods) {
            const functions = children.methods;
            functions.sort((resource1, resource2) => {
                return resource1.name!.localeCompare(resource2.name!);
            });
            functions.forEach(fn => {
                leafNodes.push(new PackageTreeItem(fn.name, '',
                    TreeItemCollapsibleState.None, CMP_KIND.METHOD, parent.getFilePath(), this.extensionPath, true,
                    parent, {}, fn.startLine, fn.startColumn));
            });
        }
        return leafNodes;
    }

    public async getFirstViewElement(): Promise<DiagramOptions> {
        const packageItems: PackageTreeItem[] | undefined | null = await this.getChildren();
        if (!packageItems) {
            return { isDiagram: false };
        }
        if (packageItems.length > 0) {
            for (let i = 0; i < packageItems.length; i++) {
                const child: PackageTreeItem | undefined = await this.getNextChild(packageItems[i]);
                if (child) {
                    return {
                        name: child.getName(),
                        kind: child.getKind(),
                        filePath: child.getFilePath(),
                        startLine: child.getStartLine(),
                        startColumn: child.getStartColumn(),
                        isDiagram: true
                    };
                }
            }
        }
        return { isDiagram: false };
    }

    async getNextChild(treeItem: PackageTreeItem): Promise<PackageTreeItem | undefined> {
        const children: PackageTreeItem[] | undefined | null = await this.getChildren(treeItem);
        if (!children || children.length === 0) {
            return;
        }

        for (let i = 0; i < children.length; i++) {
            let child: PackageTreeItem = children[i];
            if (child.getKind() === CMP_KIND.SERVICE || child.getKind() === CMP_KIND.FUNCTION_LABEL ||
                child.getKind() === CMP_KIND.RECORD_LABEL || child.getKind() === CMP_KIND.OBJECT_LABEL ||
                child.getKind() === CMP_KIND.TYPE_LABEL || child.getKind() === CMP_KIND.CONSTANT_LABEL ||
                child.getKind() === CMP_KIND.ENUM_LABEL || child.getKind() === CMP_KIND.CLASS_LABEL) {
                return await this.getNextChild(child);
            }
            if (child.getKind() === CMP_KIND.FUNCTION || child.getKind() === CMP_KIND.RESOURCE) {
                return child;
            }
        }
        return;
    }
}

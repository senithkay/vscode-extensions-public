/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 *
 */

import { BallerinaProjectComponents, ComponentInfo, ComponentViewInfo, FileListEntry, ModuleSummary, PackageSummary } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Uri } from "monaco-editor";

import { ComponentCollection } from "../../../../OverviewDiagram/util";

export class ProjectComponentProcessor {
    private projectComponents: BallerinaProjectComponents;
    private fileMap: Map<string, FileListEntry>;
    private currentPackage: PackageSummary;
    private currentModule: ModuleSummary;
    private components: ComponentCollection;


    constructor(projectComponents: BallerinaProjectComponents) {
        this.projectComponents = projectComponents;
        this.fileMap = new Map<string, FileListEntry>();
        this.components = {
            functions: [],
            services: [],
            records: [],
            objects: [],
            classes: [],
            types: [],
            constants: [],
            enums: [],
            listeners: [],
            moduleVariables: []
        };
    }

    public process() {
        if (this.projectComponents && this.projectComponents.packages) {
            this.projectComponents.packages.forEach(packageInfo => {
                this.processPackage(packageInfo);
            });
        }
    }

    private processPackage(packageInfo: PackageSummary) {
        this.currentPackage = packageInfo;

        packageInfo.modules.forEach(module => {
            this.processModule(module);
        });
    }

    private processModule(module: ModuleSummary) {
        this.currentModule = module;

        for (const [key, value] of Object.entries(module)) {
            if (key === 'name') continue;
            this.processComponents(key, value);
        }
    }

    private processComponents(type: string, components: ComponentInfo[]) {
        components.forEach(component => {
            this.components[type].push({
                filePath: genFilePath(this.currentPackage, this.currentModule, component),
                position: {
                    startLine: component.startLine,
                    startColumn: component.startColumn,
                    endLine: component.endLine,
                    endColumn: component.endColumn,
                },
                fileName: component.filePath,
                name: component.name,
                moduleName: this.currentModule.name,
            });

            const fileEntryKey = `${this.currentModule.name ? `${this.currentModule.name}/` : ''}${component.filePath}`;

            if (!this.fileMap.has(fileEntryKey)) {
                const uri = Uri.parse(genFilePath(this.currentPackage, this.currentModule, component));
                this.fileMap.set(fileEntryKey, {
                    uri: {
                        path: uri.path,
                        fsPath: uri.fsPath,
                        sheme: uri.scheme,
                        external: ''
                    },
                    fileName: `${this.currentModule.name ? `${this.currentModule.name}/` : ''}${component.filePath}`,
                });
            }
        });
    }

    public getComponents() {
        return this.components;
    }

    public getComponentsFor(file: string) {
        const filteredComponents: ComponentCollection = {
            functions: [],
            services: [],
            records: [],
            objects: [],
            classes: [],
            types: [],
            constants: [],
            enums: [],
            listeners: [],
            moduleVariables: []
        }

        for (const [type, collection] of Object.entries(this.components)) {
            collection.forEach((el: ComponentViewInfo) => {
                if (el.filePath === file) {
                    filteredComponents[type].push(el);
                }
            })
        }

        return filteredComponents;
    }

    public getFileMap() {
        return this.fileMap;
    }
}

export function genFilePath(packageInfo: PackageSummary, module: ModuleSummary, element: ComponentInfo) {
    let filePath = `${packageInfo.filePath}${module.name ? `modules/${module.name}/` : ''}${element.filePath}`
        .replace('file://', '');

    if (window.navigator.userAgent.indexOf("Win") > -1) {
        if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
            filePath = filePath.replaceAll(/\//g, '\\');
        }
    }

    return filePath;
}


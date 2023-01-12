/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from "react";

import { BallerinaProjectComponents, ComponentInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { DEFAULT_MODULE_NAME } from "../../..";
import { ComponentCollection, ComponentViewInfo, generateFileLocation } from "../../../util";
import { ComponentView } from "../ComponentView";

import './style.scss';

interface ModuleViewProps {
    projectComponents: BallerinaProjectComponents;
    updateSelection: (info: ComponentViewInfo) => void;
}


interface ModuleViewInfo {
    moduleName: string;
    components: ComponentCollection;
}

export function ModuleView(props: ModuleViewProps) {
    const { projectComponents, updateSelection } = props;
    const moduleMap = new Map<string, ModuleViewInfo>();

    projectComponents.packages.forEach(packageInfo => {
        packageInfo.modules.forEach(module => {
            const moduleName = module.name || DEFAULT_MODULE_NAME;
            Object.keys(module)
                .filter(key => module[key].length)
                .forEach(key => {
                    if (key !== 'name') {
                        module[key].forEach((element: ComponentInfo) => {
                            if (!moduleMap.has(moduleName)) {
                                moduleMap.set(moduleName, {
                                    components: {
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
                                    },
                                    moduleName: module.name || DEFAULT_MODULE_NAME
                                });
                            }
                            (moduleMap.get(moduleName) as ModuleViewInfo).components[key].push({
                                filePath: `${packageInfo.filePath}${module.name ? module.name : ''}/${element.filePath}`,
                                position: {
                                    startLine: element.startLine,
                                    startColumn: element.startColumn,
                                    endLine: element.endLine,
                                    endColumn: element.endColumn
                                },
                                fileName: element.filePath,
                                moduleName: module.name ? module.name : undefined,
                                name: element.name
                            });
                        });
                    }
                })
        })
    });


    const moduleViews: React.ReactElement[] = [];

    moduleMap.forEach(info => {
        const categories: React.ReactElement[] = [];

        Object.keys(info.components).filter(key => info.components[key].length).forEach(key => {
            const components = info.components[key].map((comp: ComponentViewInfo) => (
                // tslint:disable-next-line: jsx-key
                <ComponentView info={comp} updateSelection={updateSelection} />
            ))
            categories.push(
                <>
                    <h3>{key}</h3>
                    <div className="component-container">
                        {components}
                    </div>
                </>
            )
        })
        moduleViews.push(
            <div className="module-view-container">
                <div className="module-info">
                    <span className="module-name">{info.moduleName}</span>
                </div>
                <div className="component-info">
                    {categories}
                </div>
            </div>
        )
    });

    return (
        <>
            {moduleViews}
        </>
    )
}

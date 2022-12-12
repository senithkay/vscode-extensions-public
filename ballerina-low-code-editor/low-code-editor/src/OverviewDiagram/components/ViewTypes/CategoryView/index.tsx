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

import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { DEFAULT_MODULE_NAME } from "../../..";
import { ComponentCollection, ComponentViewInfo } from "../../../util";
import { ComponentView } from "../ComponentView";

import './style.scss'

interface CategoryViewProps {
    projectComponents: BallerinaProjectComponents;
    updateSelection: (position: NodePosition, file: string) => void;
}

export function CategoryView(props: CategoryViewProps) {
    const { projectComponents, updateSelection } = props;

    const currentComponents: ComponentCollection = {
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
    // TODO: Handle the processing of response json in a better way
    if (projectComponents) {
        projectComponents.packages.forEach(packageInfo => {
            packageInfo.modules.forEach(module => {
                Object.keys(module).forEach(key => {
                    if (key !== 'name') {
                        module[key].forEach((element: any) => {
                            currentComponents[key].push({
                                ...element,
                                folderPath: packageInfo.filePath,
                                moduleName: module.name ? module.name : DEFAULT_MODULE_NAME
                            })
                        });
                    }
                })
            })
        });
    }
    // tslint:disable-next-line: jsx-key
    // const views = components.map(comp => <ComponentView info={comp} updateSelection={updateSelection} />)

    // return (
    //     <div>
    //         <h3>{heading}</h3>
    //         <div className="component-container">
    //             {views}
    //         </div>
    //     </div>
    // );
    const categories: React.ReactElement[] = [];

    Object.keys(currentComponents).filter(key => currentComponents[key].length).forEach(key => {
        const components = currentComponents[key].map((comp: ComponentViewInfo) => (
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

    return (
        <>
            {categories}
        </>
    )
}

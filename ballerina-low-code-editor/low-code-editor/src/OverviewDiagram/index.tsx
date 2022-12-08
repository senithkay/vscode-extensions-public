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

import React, { useState } from "react";

import { BallerinaProjectComponents, ComponentSummary } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { EditorProps } from "../DiagramGenerator/vscode/Diagram";

import { ComponentCollection } from "./util";
import { CategoryView } from "./components/CategoryView";

export function OverviewDiagram(props: EditorProps) {
    const { langClientPromise, projectPaths, lastUpdatedAt } = props;
    const [components, updateProjectComponents] = useState<ComponentCollection>();

    React.useEffect(() => {
        (async () => {
            const showDiagramError = false;
            // console.log('>>> file path from props', projectPaths);
            try {
                const langClient = await langClientPromise;
                const filePaths: any = projectPaths.map(path => ({ uri: path.uri.external }))
                // console.log('>>> file paths', filePaths);
                const projectComponents: BallerinaProjectComponents = await langClient.getBallerinaProjectComponents({
                    documentIdentifiers: [...filePaths]
                });

                console.log('>>>', projectComponents);

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
                projectComponents.packages.forEach(packageInfo => {
                    packageInfo.modules.forEach(module => {
                        Object.keys(module).forEach(key => {
                            if (key !== 'name') {
                                module[key].forEach((element: any) => {
                                    currentComponents[key].push({
                                        ...element,
                                        folderPath: packageInfo.filePath,
                                        moduleName: module.name ? module.name : '.'
                                    })
                                });
                            }
                        })
                    })
                })

                updateProjectComponents(currentComponents);
                // if (genSyntaxTree?.typeData?.diagnostics && genSyntaxTree?.typeData?.diagnostics?.length > 0) {
            } catch (err) {
                // TODO: do the error view diagram
                // tslint:disable-next-line: no-console
                console.error(err)
            }

        })();
    }, [lastUpdatedAt]);

    // console.log('>>> component', componentViews);
    const comps = components && Object.keys(components)
        .filter(key => components[key].length)
        .map(key => <CategoryView heading={key} components={components[key]} />)

    return (
        <>
            {/* {components && Object.keys(components).map(key => {
                const comp = components[key].map((el: any) => <div>{JSON.stringify(el)}</div>)
                return (
                    <div>{key}</div>
                )
            })} */}
            {comps}
        </>
    )
}

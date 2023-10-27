/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from "react";
import { ComponentView } from "./ComponentView";
import { ProjectComponentProcessor } from "./util/project-component-processor";



export interface ComponentViewInfo {
    filePath: string;
    position: any;
    fileName?: string;
    moduleName?: string;
    uid?: string;
    name?: string;
}

export type ComponentCollection = {
    [key: string]: ComponentViewInfo[];
    functions: ComponentViewInfo[];
    services: ComponentViewInfo[];
    records: ComponentViewInfo[];
    objects: ComponentViewInfo[];
    classes: ComponentViewInfo[];
    types: ComponentViewInfo[];
    constants: ComponentViewInfo[];
    enums: ComponentViewInfo[];
    listeners: ComponentViewInfo[];
    moduleVariables: ComponentViewInfo[];
};


// shows a view that includes document/project symbols(functions, records, etc.)
// you can switch between files in the project and view the symbols in eachfile
// when you select a symbol, it will show the symbol's visualization in the diagram view
export function ComponentListView(props: { currentComponents: ComponentCollection | any }) {

    const categories: React.ReactElement[] = [];

    let currentComponents: ComponentCollection | any;

    if (props.currentComponents) {
        const projectComponentProcessor = new ProjectComponentProcessor(props.currentComponents);
        projectComponentProcessor.process();
        currentComponents =  projectComponentProcessor.getComponents();
    }

    // useEffect(() => {
    //     // fetchData();
    // }, []);

    if (currentComponents) {
        Object.keys(currentComponents)
            .filter((key) => currentComponents[key].length)
            .forEach((key) => {
                const filteredComponents = currentComponents[key];

                const components = filteredComponents.map((comp: ComponentViewInfo, compIndex: number) => {
                    return (
                        <ComponentView
                            key={key + compIndex}
                            info={comp}
                            updateSelection={null}
                            type={key}
                        />
                    )
                });

                if (components.length === 0) return;

                categories.push(
                    <div>
                        <div>{key}</div>
                        <div>{components}</div>
                    </div>
                );
            });
    }


    return (
        <>
            <div>List</div>
            {categories}
        </>
    );
}
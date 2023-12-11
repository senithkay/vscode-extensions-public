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
import { Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VisualizerLocation } from "@wso2-enterprise/eggplant-core";
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";


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
export function ComponentListView(props: { currentComponents: ComponentCollection | any, setSelectedComponent: React.Dispatch<any> }) {

    const { eggplantRpcClient } = useVisualizerContext();
    const categories: React.ReactElement[] = [];

    let currentComponents: ComponentCollection | any;

    if (props.currentComponents) {
        const projectComponentProcessor = new ProjectComponentProcessor(props.currentComponents);
        projectComponentProcessor.process();
        currentComponents = projectComponentProcessor.getComponents();
    }


    const CategoryContainer = styled.div`
    `;

    const Capitalize = styled.span`
        text-transform: capitalize;
    `;

    const ComponentContainer = styled.div`
        display: flex;
        flex-wrap: wrap;
    `;

    const handleComponentSelection = async (info: ComponentViewInfo) => {
        console.log({
            file: info.filePath,
            position: info.position
        })
        const context: VisualizerLocation = {
            location: {
                fileName: info.filePath,
                position: info.position
            }
        }
        const serviceST = await eggplantRpcClient.getWebviewRpcClient().getSTNodeFromLocation(context);
        if (STKindChecker.isServiceDeclaration(serviceST)) {
            props.setSelectedComponent(serviceST);
        }
    }

    if (currentComponents) {
        Object.keys(currentComponents)
            .filter((key) => currentComponents[key].length)
            .forEach((key) => {
                if (key === "functions" || key === "services") {
                    const filteredComponents = currentComponents[key];

                    const components = filteredComponents.map((comp: ComponentViewInfo, compIndex: number) => {
                        if (comp.name === "main" || key === "services") {
                            return (
                                <ComponentView
                                    key={key + compIndex}
                                    info={comp}
                                    updateSelection={handleComponentSelection}
                                    type={key}
                                />
                            )
                        }
                    });

                    if (components.length === 0) return;

                    key = key === "functions" ? "Main Function" : "Services";
                    categories.push(
                        <CategoryContainer>
                            <Typography variant="h4">
                                <Capitalize>{key}</Capitalize>
                            </Typography>
                            <ComponentContainer>{components}</ComponentContainer>
                        </CategoryContainer>
                    );
                }
            });
    }

    return (
        <>
            {categories}
        </>
    );
}
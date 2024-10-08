/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import { css } from "@emotion/css";
import { IDMType } from "@wso2-enterprise/ballerina-core";
import { STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Visitors/NodeInitVisitor";
import { DataMapperErrorBoundary } from "./ErrorBoundary";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}

export interface InlineDataMapperProps {
    stNode: STNode;
    inputTrees: IDMType[];
    outputTree: IDMType;
}

export function InlineDataMapper(props: InlineDataMapperProps) {
    const {
        stNode,
        inputTrees,
        outputTree
    } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const hasInternalError = false;

    useEffect(() => {
        async function generateNodes() {
            const context = new DataMapperContext(stNode, inputTrees, outputTree);

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(stNode, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());

        }
        generateNodes();
    }, [stNode]);

    return (
        <DataMapperErrorBoundary hasError={hasInternalError}>
            <div className={classes.root}>
                {stNode && (
                    <DataMapperHeader
                        hasEditDisabled={false}
                        onClose={undefined}
                    />
                )}
                {nodes.length > 0 && (
                    <DataMapperDiagram
                        nodes={nodes}
                        onError={undefined}
                    />
                )}
            </div>
        </DataMapperErrorBoundary>
    )
}

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
import { IDMModel } from "@wso2-enterprise/ballerina-core";

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../../visitors/NodeInitVisitor";
import { DataMapperErrorBoundary } from "./ErrorBoundary";
import { traverseNode } from "../../utils/model-utils";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}

export interface InlineDataMapperProps {
    model: IDMModel;
}

export function InlineDataMapper(props: InlineDataMapperProps) {
    const { model } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const hasInternalError = false;

    useEffect(() => {
        async function generateNodes() {
            const context = new DataMapperContext(model);

            const nodeInitVisitor = new NodeInitVisitor(context);
            traverseNode(model, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());

        }
        generateNodes();
    }, [model]);

    return (
        <DataMapperErrorBoundary hasError={hasInternalError}>
            <div className={classes.root}>
                {model && (
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

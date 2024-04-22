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

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";

import { DataMapperHeader } from "./Header/DataMapperHeader";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Visitors/NodeInitVisitor";
import { traversNode } from "../Diagram/utils/st-utils";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { FunctionDeclaration } from "ts-morph";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}

export interface MIDataMapperProps {
    fnST: FunctionDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
    goToSource: (range: Range) => void;
    applyModifications: () => void;
}

export function MIDataMapper(props: MIDataMapperProps) {
    const {
        fnST,
        inputTrees,
        outputTree,
        goToSource,
        applyModifications
    } = props;
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    useEffect(() => {
        async function generateNodes() {
            const context = new DataMapperContext(
                fnST, inputTrees, outputTree, goToSource, applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(fnST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        }
        generateNodes();
    }, [fnST]);

    return (
        <div className={classes.root}>
            {fnST && (
                <DataMapperHeader
                    hasEditDisabled={false}
                    onConfigOpen={undefined}
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
    )
}

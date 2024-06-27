/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";

import { ArrayFilterNode } from "./ArrayFilterNode";
import { SharedContainer, TreeContainer } from "../commons/Tree/Tree";
import { IO_NODE_DEFAULT_WIDTH } from "../../utils/constants";

export const useStyles = () => ({
    queryInputInputPortWrap: css({
        width: IO_NODE_DEFAULT_WIDTH,
        position: 'absolute',
        bottom: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center'
    })
});

const ArrayFilterHeader = styled.div`
    background: var(--vscode-sideBarSectionHeader-background);
    height: 40px;
    width: 100%;
    line-height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: default;
`;

const HeaderText = styled.span`
    margin-left: 10px;
    min-width: 280px;
    font-size: 13px;
    font-weight: 600;
    color: var(--vscode-inputOption-activeForeground)
`;

export interface ArrayFilterWidgetProps {
    node: ArrayFilterNode;
    title: string;
    engine: DiagramEngine;
    port: PortModel<PortModelGenerics>;
}

export function ArrayFilterNodeWidget(props: ArrayFilterWidgetProps) {
    const { node, engine, port } = props;
    const { context: { applyModifications }} = node;
    const classes = useStyles();

    return (
        <>
            <TreeContainer data-testid={'array-filter-node'}>
                <SharedContainer data-testid={"sub-mapping-node"}>
                    <ArrayFilterHeader>
                        <HeaderText>Filters</HeaderText>
                    </ArrayFilterHeader>
                </SharedContainer>
                <div className={classes.queryInputInputPortWrap}>
                    <PortWidget port={port} engine={engine} />
                </div>
            </TreeContainer>
        </>
    );
}

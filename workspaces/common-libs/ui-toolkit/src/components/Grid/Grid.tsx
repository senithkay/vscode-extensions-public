/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";

export const GridDirections = {
    row: "row",
    column: "column",
} as const;

export interface GridProps {
    id?: string;
    className?: string;
    key?: string | number;
    direction?: (typeof GridDirections)[keyof typeof GridDirections];
    children: React.ReactNode;
    item?: boolean;
    columns?: number;
}

const GridContainer = styled.div<GridProps>`
    display: grid;
    ${({ columns, direction }: GridProps) =>
        direction === GridDirections.column
            ? `grid-template-columns: repeat(${columns}, auto);
        column-gap: 2%;
        grid-auto-flow: row dense;`
            : `grid-template-rows: repeat(${columns}, auto);
        row-gap: 5%;
        grid-auto-flow: column dense;`}

    > * {
        margin-bottom: 8px;
        padding: 0 10px;
    }
`;

const GridItem = styled.div`
    width: fit-content;
    height: fit-content;
`;

export function Grid(props: GridProps) {
    const { id, className, key, children, columns, direction = GridDirections.column, item = false } = props;
    const columnCount = columns ? columns : React.Children.count(children);
    return item ? (
        <GridItem key={key}>{children}</GridItem>
    ) : (
        <GridContainer id={id} className={className} direction={direction} columns={columnCount}>
            {children}
        </GridContainer>
    );
}

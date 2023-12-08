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

export interface GridProps {
    children: React.ReactNode;
    columns?: number;
}

export interface GridContainerProps {
    columns: number;
}

export const GridContainer = styled.div<GridContainerProps>`
    display: grid;
    grid-template-columns: ${({ columns }: GridContainerProps) => `repeat(${columns}, auto)`};
    column-gap: 5%;
    grid-auto-flow: row dense;

    > * {
        margin-bottom: 8px;
        padding: 0 10px;
    }
`;

export default function Grid(props: GridProps) {
    const { children, columns = 3 } = props;
    return <GridContainer columns={columns}>{children}</GridContainer>;
}

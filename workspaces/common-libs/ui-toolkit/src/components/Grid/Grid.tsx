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

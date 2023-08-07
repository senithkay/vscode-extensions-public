/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from 'react';
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";

interface CellData {
    // Cells column number in the grid
    gridColumn: string;
    // Is this cell a header cell
    isHeader?: boolean;
    // Cell content (can be a string or a ReactNode)
    content: ReactNode | string;
}

export interface GridProps {
    data: CellData[][];
}

const GridTitleCell = styled(VSCodeDataGridCell)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.7;
  color: var(--foreground); // Override the default color to match the theme
`;

const GridCell = styled(VSCodeDataGridCell)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--foreground); // Override the default color to match the theme
`;

const GridCellWrapper = styled(VSCodeDataGridCell)`
  padding-left: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export function DataGrid(props: GridProps) {
    const { data } = props;
    return (
        <VSCodeDataGrid>
            {data.map((row, rowIndex) => (
                <VSCodeDataGridRow key={`grid_row_${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                        <GridCellWrapper key={cellIndex} gridColumn={cell.gridColumn}>
                            {cell.isHeader ? (
                                <GridTitleCell>{cell.content}</GridTitleCell>
                            ) : (
                                <GridCell>
                                    {cell.content}
                                </GridCell>
                            )}
                        </GridCellWrapper>
                    ))}
                </VSCodeDataGridRow>
            ))}
        </VSCodeDataGrid>
    );
}

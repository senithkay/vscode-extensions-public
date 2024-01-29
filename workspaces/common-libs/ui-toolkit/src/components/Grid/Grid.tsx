/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from "react";

import styled from "@emotion/styled";
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from "@vscode/webview-ui-toolkit/react";

export const DataGridRow = styled(VSCodeDataGridRow)`
  &:hover {
    background: none;
  }
`;

export const DataGridCell = styled(VSCodeDataGridCell)`
  &:hover {
    background: var(--vscode-list-hoverBackground);
    cursor: pointer;
  };
`;

export interface GridProps {
  id?: string;
  className?: string;
  columns?: number;
  children?: ReactNode;
}

export function Grid(props: GridProps) {
  const { children, columns } = props;
  const numberOfChildren = React.Children.count(children);
  const rowData = numberOfChildren > 0 ? generateRowData(columns, children) : [];

  return (
    <VSCodeDataGrid>
      {rowData}
    </VSCodeDataGrid>
  );
}

const generateRowData = (numColumns: number, children: ReactNode) => {
  const gridItems = React.Children.toArray(children);
  const rowData: ReactNode[] = [];
  const columnTemplate = Array.from({ length: numColumns }, () => '1fr').join(' ');
  for (let i = 0; i < gridItems.length; i += numColumns) {
    const row = [];
    for (let j = 0; j < numColumns; j++) {
      if (i + j < gridItems.length) {
        row.push(gridItems[i + j]);
      }
    }
    rowData.push(
      <DataGridRow grid-template-columns={columnTemplate} key={rowData?.length}>
        {row.map((cell, index) => <DataGridCell grid-column={index + 1}>{cell}</DataGridCell>)}
      </DataGridRow>
    );
  }
  return rowData;
};

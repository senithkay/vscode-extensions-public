/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from '@vscode/webview-ui-toolkit/react';

export interface AccordionTableProps {
	headers: string[];
	content: string[][];
}

export function DataGrid(props: AccordionTableProps) {
    const { headers, content} = props;

    return (
        <>
            <VSCodeDataGrid>
                <VSCodeDataGridRow row-type="header">
                    {headers.map((header, index) => (
                        <VSCodeDataGridCell key={index} cell-type="columnheader" grid-column={`${index + 1}`}>
                            {header}
                        </VSCodeDataGridCell>
                    ))}
                </VSCodeDataGridRow>
                {content.map((row, i) => (
                    <VSCodeDataGridRow key={i}>
                        {row.map((cell, j) => (
                            <VSCodeDataGridCell key={j} grid-column={`${j + 1}`}>{cell}</VSCodeDataGridCell>
                        ))}
                    </VSCodeDataGridRow>
                ))}
            </VSCodeDataGrid>
        </>
    );
}

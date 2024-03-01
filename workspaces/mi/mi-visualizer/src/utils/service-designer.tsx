/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { Button, Codicon, Typography } from "@wso2-enterprise/ui-toolkit";
import React from "react";

const CustomDataGridCell = styled(VSCodeDataGridCell)`
    :active,:focus {
        border: none;
        background: none;
    }
`;

export type SequenceComponentViewProps = {
    onOpenInSequence: () => void;
}

export const getSequenceComponentView = ({ onOpenInSequence }: SequenceComponentViewProps) => {
    return (
        <React.Fragment>
            <Typography sx={{ marginBlockEnd: 10 }} variant="h3">
                Sequences
            </Typography>
            <VSCodeDivider />
            <VSCodeDataGrid>
                <VSCodeDataGridRow row-type="header">
                    <VSCodeDataGridCell cell-type="columnheader" grid-column={1}>
                        In Sequence
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cell-type="columnheader" grid-column={2}>
                        Out Sequence
                    </VSCodeDataGridCell>
                    <VSCodeDataGridCell cell-type="columnheader" grid-column={3}>
                        Fault Sequence
                    </VSCodeDataGridCell>
                </VSCodeDataGridRow>
                <VSCodeDataGridRow>
                    <CustomDataGridCell grid-column={1}>
                        <Button
                            appearance="primary"
                            onClick={onOpenInSequence}
                        >
                            Open Diagram
                            <Codicon name="export" sx={{ marginLeft: "4px", width: "18px" }} iconSx={{ fontSize: "18px" }} />
                        </Button>
                    </CustomDataGridCell>
                    <CustomDataGridCell grid-column={2}>
                        <Button
                            appearance="primary"
                            onClick={() => console.log("Expand Out Sequence")}
                        >
                            Open Diagram
                            <Codicon name="export" sx={{ marginLeft: "4px", width: "18px" }} iconSx={{ fontSize: "18px" }} />
                        </Button>
                    </CustomDataGridCell>
                    <CustomDataGridCell grid-column={3}>
                        <Button
                            appearance="primary"
                            onClick={() => console.log("Expand Fault Sequence")}
                        >
                            Open Diagram
                            <Codicon name="export" sx={{ marginLeft: "4px", width: "18px" }} iconSx={{ fontSize: "18px" }} />
                        </Button>
                    </CustomDataGridCell>
                </VSCodeDataGridRow>
            </VSCodeDataGrid>
        </React.Fragment>
    );
};


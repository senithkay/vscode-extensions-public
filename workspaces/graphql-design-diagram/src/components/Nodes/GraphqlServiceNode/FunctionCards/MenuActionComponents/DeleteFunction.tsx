/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useContext } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import {
    LabelDeleteIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { Position } from "../../../../resources/model";

import { useStyles } from "./styles";

interface DeleteFunctionWidgetProps {
    position: Position;
}

export function DeleteFunctionWidget(props: DeleteFunctionWidgetProps) {
    const { position } = props;
    const { onDelete } = useContext(DiagramContext);

    const classes = useStyles();

    const handleDeleteClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        const functionPosition: NodePosition = {
            endColumn: position.endLine.offset,
            endLine: position.endLine.line,
            startColumn: position.startLine.offset,
            startLine: position.startLine.line
        };
        onDelete(functionPosition);
    };

    return (
        <>
            {position &&
            <MenuItem onClick={handleDeleteClick} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                <ListItemIcon style={{ marginRight: "10px", minWidth: "0px" }}>
                    <LabelDeleteIcon/>
                </ListItemIcon>
                <ListItemText className={classes.listItemText}>{"Delete Operation"}</ListItemText>
            </MenuItem>
            }
        </>
    );
}

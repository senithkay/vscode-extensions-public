/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useContext } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import {
    LabelEditIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../../../../resources/model";
import { getSTNodeFromRange } from "../../../../utils/common-util";

import { useStyles } from "./styles";

interface EditFunctionWidgetProps {
    position: Position;
    functionType: FunctionType;
}

export function EditFunctionWidget(props: EditFunctionWidgetProps) {
    const { position, functionType } = props;
    const { functionPanel, model } = useContext(DiagramContext);

    const classes = useStyles();

    const openFunctionPanel = () => {
        if (STKindChecker.isServiceDeclaration(model)) {
            const functionPosition: NodePosition = {
                endColumn: position.endLine.offset,
                endLine: position.endLine.line,
                startColumn: position.startLine.offset,
                startLine: position.startLine.line
            };
            if (functionType === FunctionType.QUERY) {
                functionPanel(functionPosition, "GraphqlResource", getSTNodeFromRange(functionPosition, model));
            } else if (functionType === FunctionType.MUTATION) {
                functionPanel(functionPosition, "GraphqlMutation", getSTNodeFromRange(functionPosition, model));
            } else if (functionType === FunctionType.SUBSCRIPTION) {
                functionPanel(functionPosition, "GraphqlSubscription", getSTNodeFromRange(functionPosition, model));
            }
        }
    };


    return (
        <>
            {position &&
            <MenuItem onClick={() => openFunctionPanel()} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                <ListItemIcon style={{ marginRight: "10px", minWidth: "0px" }}>
                    <LabelEditIcon/>
                </ListItemIcon>
                <ListItemText className={classes.listItemText}>{"Edit Operation"}</ListItemText>
            </MenuItem>
            }
        </>
    );
}

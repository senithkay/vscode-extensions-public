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
    GraphqlQueryIcon,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../resources/model";

import { useStyles } from "./styles";

interface NodeMenuItemProps {
    position: Position;
    model: STNode;
    functionType: FunctionType;
    currentST?: STNode;
}

export function NodeMenuItem(props: NodeMenuItemProps) {
    const { position, model, functionType, currentST } = props;
    const { functionPanel } = useContext(DiagramContext);

    const menuStyles = useStyles();

    const openFunctionPanel = () => {
        if (model && currentST && STKindChecker.isClassDefinition(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBrace.position.endColumn,
                endLine: model.closeBrace.position.endLine,
                startColumn: model.closeBrace.position.startColumn,
                startLine: model.closeBrace.position.startLine
            };
            if (functionType === FunctionType.CLASS_RESOURCE) {
                functionPanel(lastMemberPosition, "ServiceClassResource", undefined, position.filePath, currentST);
            }
        }
    };

    return (
        <>
            {position.filePath &&
            <MenuItem onClick={() => openFunctionPanel()} className={menuStyles.menuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    <GraphqlQueryIcon/>
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>Add Field</ListItemText>
            </MenuItem>
            }
        </>
    );
}

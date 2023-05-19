/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline
import React, { useContext } from "react";

import { ListItemIcon, ListItemText, MenuItem } from "@material-ui/core";
import {
    LabelEditIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../resources/model";

import { useStyles } from "./styles";

interface EditNodeProps {
    model: STNode;
    functionType: FunctionType;
    location: Position;
    st: STNode;
}

export function EditNode(props: EditNodeProps) {
    const { model, functionType, location, st } = props;
    const { functionPanel } = useContext(DiagramContext);

    const menuStyles = useStyles();

    const openFunctionPanel = () => {
        if (STKindChecker.isResourceAccessorDefinition(model)) {
            if (functionType === FunctionType.CLASS_RESOURCE) {
                functionPanel(model.position, "ServiceClassResource", model, location.filePath, st);
            }
        }
    };


    return (
        <>
            {model &&
            <MenuItem onClick={() => openFunctionPanel()} className={menuStyles.menuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    <LabelEditIcon/>
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>{"Edit Field"}</ListItemText>
            </MenuItem>
            }
        </>
    );
}

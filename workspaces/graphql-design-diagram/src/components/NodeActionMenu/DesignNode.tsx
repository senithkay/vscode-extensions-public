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
    DesignViewIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";

import { useStyles } from "./styles";

interface DesignNodeProps {
    model: STNode;
}

export function DesignNode(props: DesignNodeProps) {
    const { model } = props;
    const { operationDesignView } = useContext(DiagramContext);

    const menuStyles = useStyles();

    const openFunctionDesignPanel = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        operationDesignView(model.position);
    };


    return (
        <>
            {model &&
            <MenuItem onClick={openFunctionDesignPanel} className={menuStyles.menuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    <DesignViewIcon/>
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>{"Design Operation"}</ListItemText>
            </MenuItem>
            }
        </>
    );
}

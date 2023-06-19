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
    DesignViewIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../DiagramContext/GraphqlDiagramContext";
import { Position } from "../resources/model";

import { useStyles } from "./styles";

interface DesignNodeProps {
    model: STNode;
    location: Position;
}

export function DesignNode(props: DesignNodeProps) {
    const { model, location } = props;
    const { operationDesignView } = useContext(DiagramContext);

    const menuStyles = useStyles();

    const openFunctionDesignPanel = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        operationDesignView(model.position, location.filePath);
    };


    return (
        <>
            {model &&
            <MenuItem onClick={openFunctionDesignPanel} className={menuStyles.menuItem}>
                <ListItemIcon className={menuStyles.menuIcon}>
                    <DesignViewIcon/>
                </ListItemIcon>
                <ListItemText className={menuStyles.listItemText}>{"Design Field"}</ListItemText>
            </MenuItem>
            }
        </>
    );
}

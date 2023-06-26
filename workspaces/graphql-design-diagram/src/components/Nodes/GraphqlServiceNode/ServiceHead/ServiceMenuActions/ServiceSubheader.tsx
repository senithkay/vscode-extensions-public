/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline no-implicit-dependencies no-submodule-imports
import React from "react";

import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper } from "@material-ui/core";
import { LabelEditIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useGraphQlContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { GoToSourceMenuItem } from "../../../../NodeActionMenu/GoToSourceMenuItem";
import { FunctionType, Position } from "../../../../resources/model";

import { AddFunctionWidget } from "./AddFunctionWidget";
import { useStyles } from "./styles";

interface ServiceSubheaderProps {
    location: Position;
}

export function ServiceSubheader(props: ServiceSubheaderProps) {
    const { location } = props;
    const { servicePanel } = useGraphQlContext();
    const classes = useStyles();

    return (
        <>
            <Paper style={{ maxWidth: "100%" }}>
                <MenuList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                    <MenuItem onClick={() => servicePanel()} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                        <ListItemIcon style={{ marginRight: "10px", minWidth: "0px" }}>
                            <LabelEditIcon />
                        </ListItemIcon>
                        <ListItemText className={classes.listItemText}>Edit Service</ListItemText>
                    </MenuItem>
                    <Divider />
                    <AddFunctionWidget position={location} functionType={FunctionType.QUERY} />
                    <AddFunctionWidget position={location} functionType={FunctionType.MUTATION} />
                    <AddFunctionWidget position={location} functionType={FunctionType.SUBSCRIPTION} />
                    {location?.filePath &&
                    <>
                        <Divider />
                        <GoToSourceMenuItem location={location} />
                    </>
                    }
                </MenuList>
            </Paper>
        </>
    );
}

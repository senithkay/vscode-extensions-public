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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline no-implicit-dependencies no-submodule-imports
import React, { useContext } from "react";

import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper } from "@material-ui/core";
import { LabelEditIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { useStyles } from "@wso2-enterprise/project-design-diagrams/lib/components/common/NodeMenu/components/styles";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../../../../resources/model";

import { AddFunctionWidget } from "./AddFunctionWidget";

interface ServiceSubheaderProps {
    location: Position;
}

export function ServiceSubheader(props: ServiceSubheaderProps) {
    const { location } = props;
    const { servicePanel } = useContext(DiagramContext);
    const classes = useStyles();

    return (
        <>
            <Paper style={{maxWidth: "100%"}}>
                <MenuList style={{paddingTop: "0px", paddingBottom: "0px"}}>
                    <MenuItem onClick={() => servicePanel()} style={{paddingTop: "0px", paddingBottom: "0px"}}>
                        <ListItemIcon  style={{marginRight: "10px", minWidth: "0px"}}>
                            <LabelEditIcon/>
                        </ListItemIcon>
                        <ListItemText className={classes.listItemText}>Edit Service</ListItemText>
                    </MenuItem>
                    <Divider />
                    <AddFunctionWidget position={location} functionType={FunctionType.QUERY}/>
                    <AddFunctionWidget position={location} functionType={FunctionType.MUTATION}/>
                    <AddFunctionWidget position={location} functionType={FunctionType.SUBSCRIPTION}/>
                </MenuList>
            </Paper>
        </>
    );
}

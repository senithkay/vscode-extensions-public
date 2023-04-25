/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext } from "react";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { CMService as Service } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramContext } from "../../../DiagramContext/DiagramContext";
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useStyles } from "../styles/styles";

export function AddConnectorButton(props: { service: Service }) {
    const { service } = props;
    const classes = useStyles();

    const { setConnectorTarget } = useContext(DiagramContext);

    return (
        <MenuItem onClick={() => setConnectorTarget(service)}>
            <ListItemIcon>
                <AddLinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText className={classes.listItemText}>Use External API</ListItemText>
        </MenuItem>
    );
}


/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React from 'react';

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';

import { ConnectionDetails } from "../../../../api/models";

import { useStyles } from "./../styles";

export interface ConnectedButtonProps {
    activeConnection: ConnectionDetails;
    onChangeConnection: () => void;
}

export function ConnectedButton(props: ConnectedButtonProps) {
    const { activeConnection, onChangeConnection } = props;
    const classes = useStyles();

    return (
        <>
            <Box border={1} borderRadius={5} className={classes.box} key={activeConnection?.handle}>
                <Typography variant="subtitle2">
                <div>
                    <p className={classes.radioBtnTitle}>{activeConnection.displayName}</p>
                    <p className={classes.radioBtnSubtitle}>{activeConnection.userAccountIdentifier}</p>
                </div>
                </Typography>
                <IconButton
                    color="primary"
                    classes={ {
                        root: classes.changeConnectionBtn
                    } }
                    onClick={onChangeConnection}
                >
                    <EditIcon />
                </IconButton>
            </Box>
        </>
    );
}

export default ConnectedButton;

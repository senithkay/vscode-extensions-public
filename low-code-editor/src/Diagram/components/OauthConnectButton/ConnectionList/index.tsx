
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
// tslint:disable: jsx-wrap-multiline
import React from 'react';

import { Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Link from '@material-ui/core/Link';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Add from "@material-ui/icons/Add";

import { ConnectionDetails } from "../../../../api/models";
import { PrimaryButtonSquare } from '../../Buttons/PrimaryButtonSquare';
import { TooltipIcon } from "../../Portals/ConfigForm/Elements/Tooltip";

import { useStyles } from "./../styles";

export interface ConnectionListProps {
    activeConnection: ConnectionDetails;
    connectionList: ConnectionDetails[];
    onChangeConnection: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInitConnection: () => void;
}

export const ConnectionList = (props: ConnectionListProps) => {
    const { activeConnection, connectionList, onChangeConnection, onInitConnection } = props;
    const classes = useStyles();

    const connectionListElements = connectionList.map((item) => (
        <Box border={1} borderRadius={5} className={classes.radioBox} key={item.handle}>
            <FormControlLabel
                value={item.handle}
                control={<Radio className={classes.radio} />}
                label={<div>
                    <p className={classes.radioBtnTitle}>{item.displayName}</p>
                    <p className={classes.radioBtnSubtitle}>{item.userAccountIdentifier}</p>
                </div>}
            />
        </Box>
    ));

    return (
        <>
            <TooltipIcon
                title="Select an account to setup the trigger"
                placement="left"
                arrow={true}
            >
                <div className={classes.titleWrap}>
                    <Typography variant="subtitle1" className={classes.title}>
                        Choose Account
                    </Typography>
                    <Link href="/user-settings/connections">
                        (Manage)
                    </Link>
                </div>
            </TooltipIcon>
            <RadioGroup
                aria-label="accounts"
                name="account"
                value={activeConnection?.handle}
                onChange={onChangeConnection}
            >
                {connectionListElements}
            </RadioGroup>
            <PrimaryButtonSquare
                text="Connect another account"
                startIcon={<Add />}
                onClick={onInitConnection}
                className={classes.listConnectBtn}
            />
        </>
    );
};

export default ConnectionList;

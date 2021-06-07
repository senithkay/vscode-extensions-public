
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
import React, {useState} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Link from '@material-ui/core/Link';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Add from "@material-ui/icons/Add";

import { ConnectionDetails } from "../../../../api/models";
import { TooltipIcon } from "../../../../components/Tooltip";
import { PrimaryButtonSquare } from '../../Buttons/PrimaryButtonSquare';

import { useStyles } from "./../styles";

export interface ConnectionListProps {
    activeConnection: ConnectionDetails;
    connectionList: ConnectionDetails[];
    onChangeConnection: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInitConnection: () => void;
    connectionName: string
}

export const ConnectionList = (props: ConnectionListProps) => {
    const { activeConnection, connectionList, onChangeConnection, onInitConnection, connectionName } = props;
    const classes = useStyles();
    const intl = useIntl();
    const [selectedConnection, setSelectedConnection] = useState("");
    const searchPlaceholder = intl.formatMessage({
        id : "lowcode.develop.plusHolder.plusElements.statements.search.placeholder",
        defaultMessage: "Search"
    })
    const handleSearchChange = (evt: any) => {
        setSelectedConnection(evt.target.value);
    };

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

    const connectAnotherAccountButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.OAuthConnect.ConnectionList.connectAnotherAccountButton.text",
        defaultMessage: "Your Account"
    });

    return (
        <>
            <TooltipIcon
                title="Select an account to setup the trigger"
                placement="left"
                arrow={true}
            >
                <div className={classes.titleWrap}>
                    <Typography variant="subtitle1" className={classes.title}>
                        <FormattedMessage id="lowcode.develop.OAuthConnect.ConnectionList.title" defaultMessage="Choose connection"/>
                    </Typography>
                </div>
            </TooltipIcon>
            <div className={classes.searchWrapper}>
                <input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={selectedConnection}
                    onChange={handleSearchChange}
                    className={classes.searchBox}
                />
            </div>
            <RadioGroup
                aria-label="accounts"
                name="account"
                value={activeConnection?.handle}
                onChange={onChangeConnection}
            >
                {connectionListElements}
            </RadioGroup>
            <div className={classes.oauthConnectionTextWrapper}>
                <p className={classes.oauthConnectionText}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionText"
                        defaultMessage={"Or create a new connection to " + connectionName + " via"}
                    />
                </p>
            </div>
            <PrimaryButtonSquare
                text={connectAnotherAccountButtonText}
                onClick={onInitConnection}
                className={classes.listConnectBtn}
            />
            <div className={classes.oauthConnectionAltTextWrapper}>
                <p className={classes.oauthConnectionAltText}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionAltText"
                        defaultMessage={"Connect via OAuth"}
                    />
                </p>
            </div>
        </>
    );
};

export default ConnectionList;

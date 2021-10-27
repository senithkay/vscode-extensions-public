
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
import React, { ReactNode, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Divider from "@material-ui/core/Divider";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import classNames from "classnames";

import { ConnectionDetails, CONNECTION_TYPE_MANUAL } from "../../../../../api/models";
import { TooltipIcon } from "../../../../../components/Tooltip";
import { PrimaryButtonSquare } from '../../../Buttons/PrimaryButtonSquare';
import { LinePrimaryButton } from "../../FormFieldComponents/Button/LinePrimaryButton";
import { AccountAvatar } from '../AccountAvatar';
import { useStyles } from "../styles";
export const SSO_TYPE = "sso";
const GITHUB_CONNECTION = "GitHub";


export interface ConnectionListProps {
    activeConnection: ConnectionDetails;
    connectionList: ConnectionDetails[];
    onChangeConnection: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onInitConnection: () => void;
    connectionName?: string;
    onClickManualConnection?: () => void;
    isTriggerConnector?: boolean;
}

export const ConnectionList = (props: ConnectionListProps) => {
    const { activeConnection, connectionList, onChangeConnection, onInitConnection, onClickManualConnection,
            isTriggerConnector, connectionName } = props;
    const classes = useStyles();
    const intl = useIntl();
    const [selectedConnection, setSelectedConnection] = useState("");
    const [isConnectionListEmpty, setIsConnectionListEmpty] = useState(!connectionList);
    const searchPlaceholder = intl.formatMessage({
        id : "lowcode.develop.plusHolder.plusElements.statements.search.placeholder",
        defaultMessage: "Search"
    });

    const handleSearchChange = (evt: any) => {
        setSelectedConnection(evt.target.value);
    };

    const filteredList = activeConnection ? connectionList?.filter(item => item.handle !== activeConnection.handle) : connectionList;
    const ssoFilteredList = isTriggerConnector ? filteredList?.filter(item => item.type === SSO_TYPE) : connectionList?.filter(item => item.type === SSO_TYPE);
    let connectionListElements;

    if (isTriggerConnector) {
        if (connectionName === GITHUB_CONNECTION) {
            connectionListElements = filteredList.map((item) => (
                // tslint:disable-next-line:jsx-key
                <div key={item.handle}>
                    <Box border={1} borderRadius={5} className={classes.radioBox}>
                        <FormControlLabel
                            value={item.handle}
                            control={<Radio className={classes.radio}/>}
                            label={<div className={classes.listItem}>
                                <AccountAvatar connection={item}/>
                                <p className={classes.radioBtnSubtitle}>
                                    {item.type === CONNECTION_TYPE_MANUAL ? item.displayName : item.userAccountIdentifier + ' - ' + item.displayName.split('#')[1]}
                                </p>
                            </div>}
                        />
                    </Box>
                    <Divider className={classes.divider} />
                </div>
            ));
        } else {
            connectionListElements = ssoFilteredList.map((item) => (
                // tslint:disable-next-line:jsx-key
                <div key={item.handle}>
                    <Box border={1} borderRadius={5} className={classes.radioBox}>
                        <FormControlLabel
                            value={item.handle}
                            control={<Radio className={classes.radio}/>}
                            label={<div className={classes.listItem}>
                                <AccountAvatar connection={item}/>
                                <p className={classes.radioBtnSubtitle}>
                                    {item.type === CONNECTION_TYPE_MANUAL ? item.displayName : item.userAccountIdentifier + ' - ' + item.displayName.split('#')[1]}
                                </p>
                            </div>}
                        />
                    </Box>
                    <Divider className={classes.divider} />
                </div>
            ));
        }
    } else {
        connectionListElements = filteredList.map((item) => (
            // tslint:disable-next-line:jsx-key
            <div key={item.handle}>
                <Box border={1} borderRadius={5} className={classes.radioBox}>
                    <FormControlLabel
                        value={item.handle}
                        control={<Radio className={classes.radio}/>}
                        label={<div className={classes.listItem}>
                            <AccountAvatar connection={item}/>
                            <p className={classes.radioBtnSubtitle}>
                                {item.type === CONNECTION_TYPE_MANUAL ? item.displayName : item.userAccountIdentifier + ' - ' + item.displayName.split('#')[1]}
                            </p>
                        </div>}
                    />
                </Box>
                <Divider className={classes.divider} />
            </div>
        ));
    }

    const connectionListComponents: ReactNode[] = [];
    if (selectedConnection !== "") {
        const allCnts: ReactNode[] = connectionListElements.filter(el => filteredList.find(item =>
            item.handle === el.key).displayName.toLowerCase().includes(selectedConnection.toLowerCase()));

        allCnts.forEach((allCnt) => {
            connectionListComponents.push(allCnt);
        });
    } else {
        connectionListElements.forEach((allCnt) => {
            connectionListComponents.push(allCnt);
        });
    }

    const connectAnotherAccountButtonText = intl.formatMessage({
        id: "lowcode.develop.connectorForms.OAuthConnect.ConnectionList.connectAnotherAccountButton.text",
        defaultMessage: "Your Account"
    });

    const chooseConnectionText = intl.formatMessage({
        id: "lowcode.develop.OAuthConnect.ConnectionList.connection.title",
        defaultMessage: "Choose connection"
    });

    const chooseAnotherConnectionText = intl.formatMessage({
        id: "lowcode.develop.OAuthConnect.ConnectionList.another.connection.title",
        defaultMessage: "Choose another connection"
    });

    const manualConnectionButtonLabel = intl.formatMessage({
        id: "lowcode.develop.connectorForms.manualConnection.button.label",
        defaultMessage: "Manual Configuration"
    });

    return (
        <div className={activeConnection && classes.connectionContainer}>
            {(filteredList.length > 0)  &&  (
                <div>
                    <TooltipIcon
                        title="Select an account to setup the trigger"
                        placement="left"
                        arrow={true}
                    >
                        <div className={classes.titleWrap}>
                            <Typography variant="subtitle1" className={classes.title}>
                                {activeConnection ? chooseAnotherConnectionText : chooseConnectionText}
                            </Typography>
                        </div>
                    </TooltipIcon>
                    {filteredList.length > 3 && (
                        <div className={classes.searchWrapper}>
                            <input
                                type="search"
                                placeholder={searchPlaceholder}
                                value={selectedConnection}
                                onChange={handleSearchChange}
                                className={classes.searchBox}
                            />
                        </div>
                    )}
                    <div className={classes.radioContainer}>
                        <RadioGroup
                            aria-label="accounts"
                            name="account"
                            value={activeConnection?.handle}
                            onChange={onChangeConnection}
                            className={classes.radioGroup}
                        >
                            {connectionListComponents}
                        </RadioGroup>
                    </div>
                </div>
            )}
            <div className={classes.oauthConnectionTextWrapper}>
                <p className={classes.oauthConnectionText}>
                {filteredList.length > 0 ? (
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionText"
                        defaultMessage={"Or create a new connection via"}
                    />
                ) : (
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionText.noConnections"
                        defaultMessage={"Create a new connection via"}
                    />
                )}
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
                        id="lowcode.develop.connectorForms.newConnectionAltText3"
                        defaultMessage={"Connect via OAuth"}
                    />
                </p>
            </div>
            {!isTriggerConnector &&
            (
                <div>
                    <div className={classNames(classes.manualConfigBtnWrapper)}>
                        <LinePrimaryButton
                            className={classNames(classes.fullWidth, classes.manualConfigBtnSquare)}
                            text={manualConnectionButtonLabel}
                            fullWidth={false}
                            onClick={onClickManualConnection}
                        />
                    </div>
                    <div className={classes.oauthConnectionAltTextWrapper}>
                        <p className={classes.oauthConnectionAltText}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.newConnectionAltText4"
                                defaultMessage={"You will be prompted to enter configuration details"}
                            />
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConnectionList;

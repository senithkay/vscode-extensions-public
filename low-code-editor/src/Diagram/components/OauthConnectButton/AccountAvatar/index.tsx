/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import Avatar from '@material-ui/core/Avatar';
import classNames from 'classnames';
import { OAUTH_PROVIDER } from 'views/AppView/IntegrationConfigForm/model';

import { ConnectionDetails, CONNECTION_TYPE_MANUAL } from "../../../../api/models";
import { SSO_TYPE } from '../ConnectionList';
import { useStyles } from "../styles";

export interface AccountAvatarProps {
    connection: ConnectionDetails;
}

export function AccountAvatar (props: AccountAvatarProps) {
    const classes = useStyles();
    const { connection } = props;
    const accountName = connection.type === CONNECTION_TYPE_MANUAL ? connection.displayName : connection.userAccountIdentifier;
    if (connection.type === SSO_TYPE && connection.connectorName === OAUTH_PROVIDER.GITHUB){
        return <Avatar src={`https://avatars.githubusercontent.com/${connection.userAccountIdentifier}`} className={classes.avatar}/>
    } else {
        return <Avatar className={classNames(classes.avatar, classes.letterAvatar)}>{accountName.substring(0, 2).toUpperCase()}</Avatar>
    }
}

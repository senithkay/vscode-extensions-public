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


import React, { useEffect, useState } from 'react'

import { Typography } from "@material-ui/core";

import { OauthSession } from '../../../../Definitions';
import {CirclePreloader} from '../../../../PreLoader/CirclePreloader';
import { useStyles } from "../styles";

export interface PreloaderProps {
    sessionState: OauthSession;
}

export function CustomPreloader (props: PreloaderProps) {
    const {sessionState} = props;
    const classes = useStyles();

    const isAuthenticating = sessionState?.providerData?.isAuthenticating;
    const isTokenExchanging = sessionState?.exchangeTokenData?.isExchanging;
    const isConnectionFetching = sessionState?.existingConnectionData?.isFetching;

    const [ loadingState, setLoadingState ] = useState('');

    useEffect(() => {
      if (isConnectionFetching) {
        setLoadingState('Fetching connected accounts...');
      }
    }, [ isConnectionFetching ]);

    useEffect(() => {
      if (isAuthenticating) {
        setLoadingState('Authenticating...');
      }
    }, [ isAuthenticating ]);

    useEffect(() => {
      if (isTokenExchanging) {
        setLoadingState('Setting up connection...');
      }
    }, [ isTokenExchanging ]);

    return (
      <>
        <CirclePreloader position="relative" />
        <Typography variant="subtitle2" className={classes.loaderTitle}>
          {loadingState}
        </Typography>
      </>
    );
}

export default CustomPreloader

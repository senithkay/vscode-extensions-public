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

import React, { useContext, useEffect, useState } from "react";

import camelCase from "lodash.camelcase";

import { ConnectionDetails, OauthProviderConfig } from "../../../api/models";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { PrimaryButton } from "../Portals/ConfigForm/Elements/Button/PrimaryButton";

import ConnectedButton from "./ConnectedButton";
import ConnectionList from './ConnectionList';
import CustomPreloader from "./Preloader";
import { useStyles } from "./styles";

export enum ConnectionType {
  NEW = "NEW",
  UPDATED = "UPDATED",
  NOT_CHANGED = "NOT_CHANGED",
}

export interface OauthConnectButtonProps {
  connectorName: string;
  sessionId?: string;
  oauthProviderConfig?: OauthProviderConfig;
  currentConnection?: ConnectionDetails;
  className?: string;
  onSelectConnection: (type: ConnectionType, connection: ConnectionDetails) => void;
  onDeselectConnection: () => void;
  onFailure: (error: Error) => void;
}

export function OauthConnectButton(props: OauthConnectButtonProps) {
  const {
    oauthSessions,
    dispatchFetchConnectionList,
    dispatchInitOauthSession,
    dispatchResetOauthSession,
    dispatchTimeoutOauthRequest,
    dispatchDeleteOauthSession,
  } = useContext(DiagramContext).state;

  const {
    connectorName,
    sessionId,
    oauthProviderConfig,
    currentConnection,
    onSelectConnection,
    onDeselectConnection,
    onFailure,
    className,
  } = props;
  const classes = useStyles();
  const session = sessionId || camelCase(connectorName);

  // active connection in button
  const [activeConnection, setActiveConnection] = useState(currentConnection);

  const sessionState = oauthSessions[sessionId || camelCase(connectorName)];
  const connectionList = sessionState?.existingConnectionData?.connections;
  const isAuthenticating = sessionState?.providerData?.isAuthenticating;
  const isTokenExchanging = sessionState?.exchangeTokenData?.isExchanging;
  const isConnectionFetching = sessionState?.existingConnectionData?.isFetching;
  const connectionListError = sessionState?.existingConnectionData?.error;
  const isConnectionListEmpty = (!connectionList || (connectionList?.length === 0) || connectionList === undefined);
  const isOngoingFetching = (isAuthenticating || isTokenExchanging || isConnectionFetching);

  useEffect(() => {
    if (!activeConnection && !isOngoingFetching) {
      dispatchFetchConnectionList(connectorName, session);
      return;
    }
    if (isConnectionListEmpty && !connectionListError && !activeConnection && !isOngoingFetching) {
      dispatchFetchConnectionList(connectorName, session);
    }
    // set timeout if there is ongoing requests
    if (isOngoingFetching) {
      setTimeout(() => {
        dispatchTimeoutOauthRequest(session);
      }, 5000);
    }
  }, []);

  useEffect(() => {
    return () => {
      // clean up session
      dispatchDeleteOauthSession(session);
    }
  }, [])

  useEffect(() => {
    if (!isTokenExchanging && !activeConnection && !isOngoingFetching) {
      dispatchFetchConnectionList(connectorName, session);
      return;
    }
  }, [isTokenExchanging]);

  useEffect(() => {
    const newConnection = sessionState?.exchangeTokenData?.connectionDetails;
    if (newConnection) {
      // if oauth token exchange done with BE
      setActiveConnection(newConnection);
    }
  }, [sessionState?.exchangeTokenData?.connectionDetails]);

  useEffect(() => {
    // trigger onSelectConnection when changing activeConnection
    if (activeConnection) {
      const btnConnectionType = (currentConnection) ?
        (activeConnection.handle === currentConnection.handle) ?
          ConnectionType.NOT_CHANGED
          : ConnectionType.UPDATED
        : ConnectionType.NEW;

      onSelectConnection(btnConnectionType, activeConnection);
    }
  }, [activeConnection]);

  useEffect(() => {
    // trigger onFailure when changing activeConnection
    if (sessionState?.providerData?.error) {
      onFailure(sessionState.providerData.error);
    }
    if (sessionState?.exchangeTokenData?.error) {
      onFailure(sessionState.exchangeTokenData.error);
    }
  }, [
    sessionState?.providerData?.error,
    sessionState?.exchangeTokenData?.error
  ]);

  // component events

  const handleClickInitSession = () => {
    onDeselectConnection();
    dispatchResetOauthSession(session);
    dispatchInitOauthSession(session, connectorName, oauthProviderConfig);
  };

  const handleClickChangeConnection = () => {
    onDeselectConnection();
    // reset connection button
    setActiveConnection(null);
    dispatchResetOauthSession(session);
  };

  const handleChangeConnectionSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    // reset connection button
    const allConnections = sessionState?.existingConnectionData?.connections;
    const selectedConnection = (event.target).value;
    setActiveConnection(allConnections?.find((connection: any) => connection.handle === selectedConnection));
  };

  // render elements

  function renderConnectedButton() {
    return (
      <ConnectedButton
        activeConnection={activeConnection}
        onChangeConnection={handleClickChangeConnection}
      />
    );
  }
  function renderConnectionList() {
    return (
      <ConnectionList
        activeConnection={activeConnection}
        connectionList={connectionList}
        onChangeConnection={handleChangeConnectionSelection}
        onInitConnection={handleClickInitSession}
      />
    );
  }
  function renderConnectButton() {
    return (
      <PrimaryButton
        text={`Connect to ${connectorName}`}
        onClick={handleClickInitSession}
        className={className ? className : classes.mainConnectBtn}
      />
    );
  }

  return (
    <div className={classes.root}>
      {isOngoingFetching && <CustomPreloader sessionState={sessionState} />}
      {!isOngoingFetching && activeConnection && renderConnectedButton()}
      {!isOngoingFetching && !activeConnection && (!isConnectionListEmpty ? renderConnectionList() : renderConnectButton())}
    </div>
  );

}

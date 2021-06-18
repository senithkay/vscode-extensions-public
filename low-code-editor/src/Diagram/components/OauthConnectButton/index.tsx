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
import { FormattedMessage, useIntl } from "react-intl";

import { Box, IconButton, Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import { Status } from "components/Status";
import camelCase from "lodash.camelcase";

import { ConnectionDetails, OauthProviderConfig } from "../../../api/models";
import { Context } from "../../../Contexts/Diagram";


import ConnectedButton from "./ConnectedButton";
import ConnectionList from './ConnectionList';
import CustomPreloader from "./Preloader";
import { useStyles } from "./styles";
import { LinePrimaryButton } from "components/DiagramEditor/components/Button/LinePrimaryButton";
import { PrimaryButton } from "components/DiagramEditor/components/Button/PrimaryButton";

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
  selectedConnectionType?: ConnectionType;
  onSave?: () => void;
  onClickManualConnection?: () => void;
  onSaveNext?: () => void;
}

export function OauthConnectButton(props: OauthConnectButtonProps) {
  const {
    oauthSessions,
    dispatchGetAllConfiguration,
    dispatchFetchConnectionList,
    dispatchInitOauthSession,
    dispatchResetOauthSession,
    dispatchTimeoutOauthRequest,
    dispatchDeleteOauthSession,
  } = useContext(Context).state;

  const {
    connectorName,
    sessionId,
    oauthProviderConfig,
    currentConnection,
    onSelectConnection,
    onDeselectConnection,
    onFailure,
    className,
    selectedConnectionType,
    onSave,
    onClickManualConnection,
    onSaveNext
  } = props;
  const classes = useStyles();
  const intl = useIntl();
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
      dispatchFetchConnectionList(connectorName, session);
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
    dispatchGetAllConfiguration();
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
  const activeConnectionLabel = () => (
      <>
        <div className={classes.activeConnectionWrapper}>
          <div className={classes.activeConnectionWrapperChild1}>
            <Box border={1} borderRadius={5} className={classes.activeConnectionBox} key={activeConnection?.handle}>
              <Typography variant="subtitle2">
                <p className={classes.radioBtnSubtitle}>{activeConnection.userAccountIdentifier}</p>
              </Typography>
            </Box>
          </div>
          <div>
            <Status type={"Connected"} />
          </div>
        </div>
        <Divider />
      </>
  );

  function renderConnectedButton() {
    return (
        <>
          <ConnectedButton
              activeConnection={activeConnection}
              onChangeConnection={handleClickChangeConnection}
          />
          <div className={classes.saveBtnWrapper}>
            {(selectedConnectionType === ConnectionType.NEW) ? (
              <div className={classes.saveConnectorBtnHolder}>
                <LinePrimaryButton
                  text="Save Connection"
                  fullWidth={true}
                  onClick={onSave}
                />
                <PrimaryButton
                    text="Continue to invoke API"
                    fullWidth={true}
                    onClick={onSaveNext}
                />
              </div>
            ) : (
              <div className={classes.saveConnectorBtnHolder}>
                <PrimaryButton
                    text="Save Connection"
                    fullWidth={true}
                    onClick={onSave}
                />
              </div>
            )}
          </div>
        </>
    );
  }
  function renderConnectionList() {
    return (
        <>
          {activeConnection && activeConnectionLabel()}
          <ConnectionList
              activeConnection={activeConnection}
              connectionList={connectionList}
              connectionName={connectorName}
              onChangeConnection={handleChangeConnectionSelection}
              onInitConnection={handleClickInitSession}
              onClickManualConnection={onClickManualConnection}
          />
        </>
    );
  }

  const connectYourAccountButtonText = intl.formatMessage({
    id: "lowcode.develop.connectorForms.OAuthConnect.ConnectionList.connectAnotherAccountButton.text",
    defaultMessage: "Your Account"
  });

  function renderConnectButton() {
    return (
      <div>
        <div className={classes.oauthConnectionTextWrapper}>
                <p className={classes.oauthConnectionText}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionText.noConnections"
                        defaultMessage={"Create a new connection via"}
                    />
                </p>
            </div>
            <PrimaryButton
                text={connectYourAccountButtonText}
                onClick={handleClickInitSession}
                className={classes.mainConnectBtn}
            />
            <div className={classes.oauthConnectionAltTextWrapper}>
                <p className={classes.oauthConnectionAltText}>
                    <FormattedMessage
                        id="lowcode.develop.connectorForms.newConnectionAltText"
                        defaultMessage={"Connect via OAuth"}
                    />
                </p>
            </div>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {isOngoingFetching && <CustomPreloader sessionState={sessionState} />}
      {!isOngoingFetching && activeConnection && (selectedConnectionType === ConnectionType.NEW || selectedConnectionType === ConnectionType.UPDATED) && renderConnectedButton()}
      {!isOngoingFetching && activeConnection && (selectedConnectionType === ConnectionType.NOT_CHANGED) && renderConnectionList()}
      {!isOngoingFetching && !activeConnection && (!isConnectionListEmpty ? renderConnectionList() : renderConnectButton())}
    </div>
  );

}

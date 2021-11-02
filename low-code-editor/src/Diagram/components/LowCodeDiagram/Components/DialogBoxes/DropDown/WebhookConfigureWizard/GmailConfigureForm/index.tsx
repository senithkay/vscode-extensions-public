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
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    FunctionDefinition, STKindChecker
} from "@ballerina/syntax-tree";

import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { Gcalendar } from "../../../../../../../../Definitions/connector";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../../models";
import { FormAutocomplete } from "../../../../../../FormComponents/FormFieldComponents/Autocomplete";
import { PrimaryButton } from "../../../../../../FormComponents/FormFieldComponents/Button/PrimaryButton";
import { ConnectionType, OauthConnectButton } from "../../../../../../FormComponents/OauthConnectButton";
import { DiagramOverlayPosition } from "../../../../../../Portals/Overlay";
import { useStyles } from "../../styles";

interface GmailConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function GmailConfigureForm(props: GmailConfigureFormProps) {
    const {
        api: {
            insights: {
                onEvent
            },
            code: {
                modifyTrigger,
            }
        },
        props: {
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
        }
    } = useContext(Context);
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const { onComplete, currentConnection } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [activeConnection, setActiveConnection] = useState<ConnectionDetails>(currentConnection);
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    const [triggerChanged, setTriggerChanged] = useState(false);
    const [gmailEvent, setGmailEvent] = useState<string>();
    const Trigger = "Gmail";

    // HACK: hardcoded event list until get it form connector API
    const gmailEvents: ConnectorEvents = {
        onNewEmail: {
            type: "gmail:Message",
            variable: "message"
        },
        onNewThread: {
            type: "gmail:MailThread",
            variable: "thread"
        },
        onNewAttachment: {
            type: "gmailListener:MailAttachment",
            variable: "attachment"
        },
        onNewLabeledEmail: {
            type: "gmailListener:ChangedLabel",
            variable: "changedLabeldMsg"
        },
        onNewStarredEmail: {
            type: "gmail:Message",
            variable: "message"
        },
        onLabelRemovedEmail: {
            type: "gmailListener:ChangedLabel",
            variable: "changedLabeldMsg"
        },
        onStarRemovedEmail: {
            type: "gmail:Message",
            variable: "message"
        },
    };

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);

    // handle oauth connect button callbacks
    function handleOnSelectConnection(type: ConnectionType, connection: ConnectionDetails) {
        if (type !== ConnectionType.NOT_CHANGED && connection) {
            setActiveConnection(connection);
        }
    }

    function handleOnDeselectConnection() {
        setActiveConnection(undefined);
    }

    function handleError() {
        setActiveConnection(undefined);
    }

    const handleGmailEventChange = (event: object, value: any) => {
        setGmailEvent(value);
    };

    const getKeyFromCalConnection = (key: string) => {
        return activeConnection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key).codeVariableKey;
    };

    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createGmailTrigger();
        } else {
            updateGmailTrigger();
        }
    };

    // handle trigger configure complete
    const createGmailTrigger = () => {
        const clientId = getKeyFromCalConnection('clientIdKey');
        const clientSecret = getKeyFromCalConnection('clientSecretKey');
        const refreshToken = getKeyFromCalConnection('refreshTokenKey');

        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "gmail",
            PORT: 8090,
            CLIENT_ID: clientId,
            CLIENT_SECRET: clientSecret,
            REFRESH_TOKEN: refreshToken,
            EVENT: gmailEvent,
            EVENT_TYPE: gmailEvents[gmailEvent].type,
            EVENT_VAR: gmailEvents[gmailEvent].variable,
        });
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: "Gmail"
        };
        onEvent(event);
    };

    // handle calendar trigger update
    const updateGmailTrigger = () => {
        // TODO: need to implement update logic
    };

    const chooseEventPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GmailConfigWizard.chooseEvent.placeholder",
        defaultMessage: "Choose Event"
    });

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.GmailConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    return (
        <>
            <div className={classes.customWrapper}>
                <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GmailConfigWizard.googleConnection.title" defaultMessage="Google Connection" /></p>
                <OauthConnectButton
                    connectorName={Trigger}
                    currentConnection={activeConnection}
                    onSelectConnection={handleOnSelectConnection}
                    onDeselectConnection={handleOnDeselectConnection}
                    onFailure={handleError}
                    isTriggerConnector={true}
                />
                <p />
                {activeConnection && (
                    <>
                        <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GmailConfigWizard.googleGmailEvent.title.text" defaultMessage="Event" /></p>
                        <FormAutocomplete
                            placeholder={chooseEventPlaceholder}
                            itemList={Object.keys(gmailEvents)}
                            value={gmailEvent}
                            onChange={handleGmailEventChange}
                        />
                    </>
                )}
            </div>

            { activeConnection && gmailEvent &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text={saveConfigButton}
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                )}
        </>
    );
}

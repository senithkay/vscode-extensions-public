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
// tslint:disable: jsx-wrap-multiline
import React, {useContext, useEffect, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";

import {STKindChecker} from "@ballerina/syntax-tree";

import {DiagramOverlayPosition} from "../../../../../Portals/Overlay";
import {ConnectionDetails} from "../../../../../../../api/models";
import {Context} from "../../../../../../../Contexts/Diagram";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../models";
import {FormAutocomplete} from "../../../../FormFieldComponents/Autocomplete";
import {PrimaryButton} from "../../../../FormFieldComponents/Button/PrimaryButton";
import {FormTextInput} from "../../../../FormFieldComponents/TextField/FormTextInput";
import {SourceUpdateConfirmDialog} from "../../../SourceUpdateConfirmDialog";
import {useStyles} from "../../styles";

interface ASBConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function ASBConfigureForm(props: ASBConfigureFormProps) {
    const {
        props: {
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
        },
        api: {
            insights: {
                onEvent,
            },
            code: {
                modifyTrigger
            }
        }
    } = useContext(Context);

    const {onComplete} = props;
    const classes = useStyles();
    const intl = useIntl();

    const [triggerChanged, setTriggerChanged] = useState(false);
    const [connectionStr, setConnectionStr] = useState<string>();
    const [queueName, setQueueName] = useState<string>();
    const [receiveMode, setASBEvent] = useState<string>();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // HACK: hardcoded event list until get it from connector API
    const receiveModes = ['PEEKLOCK', 'RECEIVEANDDELETE'];

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);

    // handle oauth connect button callbacks
    const handleConnectionStrChange = (value: string) => {
        setConnectionStr(value);
    };
    const handleQueueNameChange = (value: string) => {
        setQueueName(value);
    };
    const handleASBEventChange = (event: object, value: string) => {
        setASBEvent(value);
    };
    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createASBTrigger();
        } else {
            setShowConfirmDialog(true);
        }
    };

    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };

    // handle trigger configure complete
    const createASBTrigger = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "asb",
            CONNECTION_STRING: connectionStr,
            QUEUE_NAME: queueName,
            RECEIVE_MODE: receiveMode,
        });
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: "ASB"
        };
        onEvent(event);
    };

    const connectionStrPlaceholder = intl.formatMessage({
        id: "lowcode.develop.ASBConfigWizard.connectionStr.placeholder",
        defaultMessage: "Connection String"
    });

    const queueNamePlaceholder = intl.formatMessage({
        id: "lowcode.develop.ASBConfigWizard.queueName.placeholder",
        defaultMessage: "Queue Name"
    });

    const asbConfigTooltips = {
        asbTrigger: {
            connectionStr: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.asbTrigger.connectionStr.tooltip.title",
                defaultMessage: "Azure Service Bus connection string"
            }),
            queueName: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.asbTrigger.queueName.tooltip.title",
                defaultMessage: "Azure Service Bus queue name"
            }),
        }
    };

    const chooseReceiveModePlaceholder = intl.formatMessage({
        id: "lowcode.develop.ASBConfigWizard.receiveMode.placeholder",
        defaultMessage: "Receive Mode"
    });

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.ASBConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label={connectionStrPlaceholder}
                    defaultValue={connectionStr}
                    onChange={handleConnectionStrChange}
                    customProps={{
                        optional: false,
                        tooltipTitle: asbConfigTooltips.asbTrigger.connectionStr
                    }}
                />
                <FormTextInput
                    label={queueNamePlaceholder}
                    defaultValue={queueName}
                    onChange={handleQueueNameChange}
                    customProps={{
                        optional: false,
                        tooltipTitle: asbConfigTooltips.asbTrigger.queueName
                    }}
                />
                <p className={classes.textFieldLabel}>
                    <FormattedMessage id="lowcode.develop.ASBConfigWizard.ASBEvent.title.text" defaultMessage="Receive Mode"/>
                </p>
                <FormAutocomplete
                    placeholder={chooseReceiveModePlaceholder}
                    itemList={receiveModes}
                    value={receiveMode}
                    onChange={handleASBEventChange}
                />
            </div>

            {connectionStr && queueName &&
            (
                <div className={classes.customFooterWrapper}>
                    <PrimaryButton
                        text={saveConfigButton}
                        onClick={handleUserConfirm}
                        disabled={isFileSaving}
                    />
                </div>
            )}

            {showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={createASBTrigger}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}

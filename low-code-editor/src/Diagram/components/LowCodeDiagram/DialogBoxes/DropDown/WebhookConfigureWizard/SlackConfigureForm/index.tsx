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

import {ConnectionDetails} from "../../../../../../../api/models";
import {Context} from "../../../../../../../Contexts/Diagram";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../models";
import {FormAutocomplete} from "../../../../../FormComponents/FormFieldComponents/Autocomplete";
import {PrimaryButton} from "../../../../../FormComponents/FormFieldComponents/Button/PrimaryButton";
import {FormTextInput} from "../../../../../FormComponents/FormFieldComponents/TextField/FormTextInput";
import {DiagramOverlayPosition} from "../../../../../Portals/Overlay";
import {SourceUpdateConfirmDialog} from "../../../SourceUpdateConfirmDialog";
import {useStyles} from "../../styles";

interface SlackConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function SlackConfigureForm(props: SlackConfigureFormProps) {
    const {
        api: {
            insights: {
                onEvent,
            },
            code: {
                modifyTrigger
            }
        },
        props: {
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
        }
    } = useContext(Context);

    const {onComplete} = props;
    const classes = useStyles();
    const intl = useIntl();

    const [triggerChanged, setTriggerChanged] = useState(false);
    const [verificationToken, setVerificationToken] = useState<string>();
    const [slackEvent, setSlackEvent] = useState<string>();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // HACK: hardcoded event list until get it from connector API
    const slackEvents = ['onAppMention', 'onChannelCreated', 'onEmojiChanged', 'onFileShared',
        'onMemberJoinedChannel', 'onMessage', 'onReactionAdded', 'onTeamJoin'];

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);

    // handle oauth connect button callbacks
    const handleVerificationTokenChange = (value: string) => {
        setVerificationToken(value);
    };
    const handleSlackEventChange = (event: object, value: string) => {
        setSlackEvent(value);
    };
    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createSlackTrigger();
        } else {
            setShowConfirmDialog(true);
        }
    };

    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };

    // handle trigger configure complete
    const createSlackTrigger = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "slack",
            PORT: 8090,
            VERIFICATION_TOKEN: verificationToken,
            EVENT: slackEvent,
            RECORD_TYPE: slackEvent.slice(2) + "Event"
        });
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: "Slack"
        };
        onEvent(event);
    };

    const verificationTokenPlaceholder = intl.formatMessage({
        id: "lowcode.develop.SlackConfigWizard.verificationToken.placeholder",
        defaultMessage: "Verification Token"
    });

    const slackConfigTooltips = {
        slackTrigger: {
            verificationToken: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.slackTrigger.verificationToken.tooltip.title",
                defaultMessage: "Slack Verification Token"
            }),
        }
    };

    const chooseEventPlaceholder = intl.formatMessage({
        id: "lowcode.develop.SlackConfigWizard.chooseEvent.placeholder",
        defaultMessage: "Choose Event"
    });

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.SlackConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label={verificationTokenPlaceholder}
                    defaultValue={verificationToken}
                    onChange={handleVerificationTokenChange}
                    customProps={{
                        optional: false,
                        tooltipTitle: slackConfigTooltips.slackTrigger.verificationToken
                    }}
                />
                <p className={classes.textFieldLabel}>
                    <FormattedMessage id="lowcode.develop.SlackConfigWizard.SlackEvent.title.text" defaultMessage="Event"/>
                </p>
                <FormAutocomplete
                    placeholder={chooseEventPlaceholder}
                    itemList={slackEvents}
                    value={slackEvent}
                    onChange={handleSlackEventChange}
                />
            </div>

            {verificationToken && slackEvent &&
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
                    onConfirm={createSlackTrigger}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}

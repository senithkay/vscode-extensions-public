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
import React, { useContext, useEffect, useState } from "react";
import {FormattedMessage, useIntl} from "react-intl";

import {
    CaptureBindingPattern,
    FunctionBodyBlock,
    FunctionDefinition,
    ModulePart,
    ModuleVarDecl,
    STKindChecker
} from "@ballerina/syntax-tree";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../../models";
import { updatePropertyStatement } from "../../../../../../../utils/modification-util";
import { FormAutocomplete } from "../../../../../ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../../ConfigForm/Elements/TextField/FormTextInput";
import { SourceUpdateConfirmDialog } from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";

interface SalesforceConfigureFormProps {
    position: DiagramOverlayPosition;
    isTriggerTypeChanged: boolean;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function SalesforceConfigureForm(props: SalesforceConfigureFormProps) {
    const {
        state,
        api: {
            insights: {
                onEvent,
            },
            code: {
                modifyTrigger,
                modifyDiagram
            }
        },
        props: {
            originalSyntaxTree,
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
        }
    } = useContext(Context);
    const {
    } = state;
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
    const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
    const { onComplete, isTriggerTypeChanged } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [ triggerChanged, setTriggerChanged ] = useState(false);
    const [ channelName, setTopic ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ showConfirmDialog, setShowConfirmDialog ] = useState(false);
    const [ salesforceEvent, setSalesforceEvent ] = useState<string>();

    const Trigger = "Salesforce";

    // HACK: hardcoded event list until get it from connector API
    const events = ["onCreate", "onUpdate", "onDelete", "onRestore"];

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);

    const handleTopicOnChange = (value: string) => {
        setTopic(value);
    };
    const handleUsernameOnChange = (value: string) => {
        setUsername(value);
    };
    const handlePasswordOnChange = (value: string) => {
        setPassword(value);
    };
    const handleEventChange = (event: object, value: string) => {
        setSalesforceEvent(value);
    };

    // handle SFDC trigger update
    const updateSalesforceTrigger = () => {
        const moduleVarDecls: ModuleVarDecl[] = (originalSyntaxTree as ModulePart).members.filter(members =>
            STKindChecker.isModuleVarDecl(members)) as ModuleVarDecl[];
        const pushTopicsVarNode = moduleVarDecls.find(moduleVarDecl => ((moduleVarDecl.
            typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value === "pushTopic");
        const listenerConfigNode = (originalSyntaxTree as ModulePart).members?.find(member => (((member as ModuleVarDecl)?.
            typedBindingPattern?.bindingPattern) as CaptureBindingPattern)?.typeData?.
            typeSymbol?.name === "ListenerConfiguration");

        const pushTopicVarTemplate = `string pushTopic = "${channelName}";`;
        const listenerConfigTemplate = `sfdc:ListenerConfiguration listenerConfig = {\n
                                            username: "${username}",\n
                                            password: "${password}"\n
                                        };\n`

        const modifications: STModification[] = [];
        if (pushTopicsVarNode && listenerConfigNode) {
            modifications.push(updatePropertyStatement(pushTopicVarTemplate, pushTopicsVarNode.position));
            modifications.push(updatePropertyStatement(listenerConfigTemplate, listenerConfigNode.position));

            modifyDiagram(modifications);
            setTriggerChanged(true);
        }
    }

    const createSalesforceTrigger = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "salesforce",
            CHANNEL_NAME: channelName,
            USER_NAME: username,
            PASSWORD: password,
            EVENT: salesforceEvent,
        });

        const userEvent: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: Trigger
        };
        onEvent(userEvent);
    }

    // handle trigger configure complete
    const handleConfigureOnSave = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createSalesforceTrigger();
        } else if (!isTriggerTypeChanged) {
            updateSalesforceTrigger();
        } else {
            setShowConfirmDialog(true);
        }
    };

    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };

    const userNamePlaceholder = intl.formatMessage({
        id: "lowcode.develop.salesForceConfigWizard.username.placeholder",
        defaultMessage: "Username"
    });

    const passwordPlaceholder = intl.formatMessage({
        id: "lowcode.develop.salesForceConfigWizard.password.placeholder",
        defaultMessage: "Password"
    });

    const topicPlaceholder = intl.formatMessage({
        id: "lowcode.develop.salesForceConfigWizard.channelName.placeholder",
        defaultMessage: "Channel Name"
    })

    const eventPlaceholder = intl.formatMessage({
        id: "lowcode.develop.salesForceConfigWizard.event.placeholder",
        defaultMessage: "Event"
    })

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.salesForceConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    const salesforceConfigTooltips = {
        salesforceTrigger: {
            username: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.salesforceTrigger.username.tooltip.title",
                defaultMessage: "The key in your Salesforce username."
            }),
            password: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.salesforceTrigger.password.tooltip.title",
                defaultMessage: "Enter the Salesforce password appended with your Salesforce security token."
            }),
            channelName: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.salesforceTrigger.channelName.tooltip.title",
                defaultMessage: "The channelName of the Push type that was added to your Salesforce account to receive notifications."
            })
        }
    }
    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label={userNamePlaceholder}
                    defaultValue={username}
                    onChange={handleUsernameOnChange}
                    customProps={{
                        optional: false,
                        tooltipTitle: salesforceConfigTooltips.salesforceTrigger.username
                    }}
                />
                <FormTextInput
                    label={passwordPlaceholder}
                    defaultValue={password}
                    onChange={handlePasswordOnChange}
                    customProps={{
                        optional: false,
                        secret: true,
                        tooltipTitle: salesforceConfigTooltips.salesforceTrigger.password
                    }}
                />
                <FormTextInput
                    label={topicPlaceholder}
                    defaultValue={channelName}
                    onChange={handleTopicOnChange}
                    customProps={{
                        optional: false,
                        tooltipTitle: salesforceConfigTooltips.salesforceTrigger.channelName
                    }}
                />
                <p className={classes.textFieldLabel}>
                    <FormattedMessage id="lowcode.develop.salesforceConfigWizard.event.title.text" defaultMessage="Event" />
                </p>
                <FormAutocomplete
                    placeholder={eventPlaceholder}
                    itemList={events}
                    value={salesforceEvent}
                    onChange={handleEventChange}
                />
            </div>
            { channelName && username && password && salesforceEvent &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text={saveConfigButton}
                            className={classes.saveBtn}
                            onClick={handleConfigureOnSave}
                            disabled={isFileSaving}
                        />
                    </div>
                )}
            { showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={createSalesforceTrigger}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}

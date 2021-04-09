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

import { FunctionBodyBlock, FunctionDefinition } from "@ballerina/syntax-tree";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { TRIGGER_TYPE_WEBHOOK } from "../../../../../../../models";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../../ConfigForm/Elements/TextField/FormTextInput";
import { SourceUpdateConfirmDialog } from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";

interface SalesforceConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [ key: string ]: any;
}

export function SalesforceConfigureForm(props: SalesforceConfigureFormProps) {
    const { state } = useContext(DiagramContext);
    const {
        isMutationProgress: isFileSaving,
        isLoadingSuccess: isFileSaved,
        syntaxTree,
        onModify: dispatchModifyTrigger,
        trackTriggerSelection } = state;
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
    const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
    const { onComplete } = props;
    const classes = useStyles();

    const [ showConfirmDialog, setShowConfirmDialog ] = useState(false);
    const [ triggerChanged, setTriggerChanged ] = useState(false);
    const [ topic, setTopic ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");

    const Trigger = "Salesforce";

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [ isFileSaving, isFileSaved ]);

    const handleTopicOnChange = (value: string) => {
        setTopic(value);
    };
    const handleUsernameOnChange = (value: string) => {
        setUsername(value);
    };
    const handlePasswordOnChange = (value: string) => {
        setPassword(value);
    };
    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };
    const handleUserConfirm = () => {
        if (isEmptySource) {
            handleConfigureOnSave();
        } else {
            // get user confirmation if code there
            setShowConfirmDialog(true);
        }
    };
    // handle trigger configure complete
    const handleConfigureOnSave = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        dispatchModifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "salesforce",
            PUSH_TOPIC_NAME: topic,
            USER_NAME: username,
            PASSWORD: password,
        });
        trackTriggerSelection(Trigger);
    };

    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label="Username"
                    defaultValue={username}
                    onChange={handleUsernameOnChange}
                    customProps={{ optional: false }}
                />
                <FormTextInput
                    label="Password"
                    defaultValue={password}
                    onChange={handlePasswordOnChange}
                    customProps={{ optional: false }}
                />
                <FormTextInput
                    label="Topic"
                    defaultValue={topic}
                    onChange={handleTopicOnChange}
                    customProps={{ optional: false }}
                />
            </div>
            { topic && username && password &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text="Save"
                            className={classes.saveBtn}
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                ) }
            { showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={handleConfigureOnSave}
                    onCancel={handleDialogOnCancel}
                />
            ) }
        </>
    );
}

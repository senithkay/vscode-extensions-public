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
import React, { useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { STNode } from "@ballerina/syntax-tree";

import { wizardStyles } from "../../../../../../ConfigForms/style";
import { PrimaryButton } from "../../../Button/PrimaryButton";
import { SecondaryButton } from "../../../Button/SecondaryButton";
import { VariableUserInputs } from '../../models/definitions';
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import { getDefaultModel } from "../../utils";
import { LeftPane } from '../LeftPane';
import { RightPane } from '../RightPane';

import { statementEditorStyles } from "./styles";

export interface ViewProps {
    kind: string,
    label: string,
    formArgs: any,
    userInputs?: VariableUserInputs,
    validate?: (field: string, isInvalid: boolean, isEmpty: boolean) => void
    isMutationInProgress?: boolean
    validForm?: boolean
    onCancel?: () => void
    onSave?: () => void
    onChange?: (property: string) => void
}

export function ViewContainer(props: ViewProps) {
    const {
        kind,
        label,
        formArgs,
        userInputs,
        validate,
        isMutationInProgress,
        validForm,
        onCancel,
        onSave,
        onChange
    } = props;
    const intl = useIntl();

    const stmtModel = formArgs.model ? formArgs.model.initializer : getDefaultModel(kind);

    const [model] = useState({ ...stmtModel });

    const [currentModel, setCurrentModel] = useState({model});

    const [onCancelClicked, setOnCancel] = useState(false);

    const currentModelHandler = (cModel: STNode) => {
        setCurrentModel({
            model: cModel
        });
    };

    const onCancelHandler = () => {
        setOnCancel(true);
    }

    useEffect(() => {
        return () => {
            onCancel();
        }
    }, [onCancelClicked])

    const overlayClasses = statementEditorStyles();
    const wizardStylesClasses = wizardStyles();

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    return (
        <div className={overlayClasses.stmtEditor}>
            <div className={overlayClasses.titleLine}/>
            <div className={overlayClasses.contentPane}>
                <StatementEditorContextProvider
                    model={model}
                    onCancelClicked={onCancelClicked}
                    onSave={onSave}
                    onChange={onChange}
                    validate={validate}
                >
                    <LeftPane
                        currentModel={currentModel}
                        kind={kind}
                        label={label}
                        userInputs={userInputs}
                        currentModelHandler={currentModelHandler}
                    />
                </StatementEditorContextProvider>
                <div className={overlayClasses.vl}/>
                <RightPane/>
            </div>
            <div className={overlayClasses.bottomPane}>
                <div className={wizardStylesClasses.buttonWrapper}>
                    <SecondaryButton
                        text={cancelVariableButtonText}
                        fullWidth={false}
                        onClick={onCancelHandler}
                    />
                    <PrimaryButton
                        dataTestId="save-btn"
                        text={saveVariableButtonText}
                        disabled={isMutationInProgress || !validForm}
                        fullWidth={false}
                        onClick={onSave}
                    />
                </div>
            </div>
        </div>
    )
}


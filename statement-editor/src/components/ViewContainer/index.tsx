/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext } from 'react';
import { useIntl } from "react-intl";

import {
    PrimaryButton,
    SecondaryButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { getModifications } from "../../utils";
import { sendDidChange, sendDidClose, sendDidOpen } from "../../utils/ls-utils";
import { EditorPane } from '../EditorPane';
import { useStatementEditorStyles } from "../styles";

export interface ViewContainerProps {
    label: string;
    formArgs: any;
    config: {
        type: string;
        model?: STNode;
    };
    isStatementValid: boolean;
    currentModelHandler: (model: STNode) => void;
    onWizardClose: () => void;
    onCancel: () => void;
}

export function ViewContainer(props: ViewContainerProps) {
    const {
        label,
        formArgs,
        config,
        isStatementValid,
        currentModelHandler,
        onWizardClose,
        onCancel
    } = props;
    const intl = useIntl();
    const overlayClasses = useStatementEditorStyles();
    const stmtCtx = useContext(StatementEditorContext);
    const {
        modelCtx: {
            statementModel,
            currentModel
        },
        getLangClient,
        applyModifications,
        currentFile,
        modules: {
            modulesToBeImported
        }
    } = stmtCtx;
    const exprSchemeURI = `expr://${currentFile.path}`;
    const fileSchemeURI = `file://${currentFile.path}`;


    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const onSaveClick = () => {
        sendDidClose(exprSchemeURI, getLangClient).then();
        sendDidOpen(fileSchemeURI, currentFile.content, getLangClient).then();
        const modifications = getModifications(statementModel, config, formArgs, Array.from(modulesToBeImported) as string[]);
        applyModifications(modifications);
        onWizardClose();
        sendDidClose(fileSchemeURI, getLangClient).then();
    };

    const onCancelClick = async () => {
        await sendDidChange(exprSchemeURI, currentFile.content, getLangClient);
        sendDidClose(exprSchemeURI, getLangClient).then();
        onCancel();
    }

    return (
        (
            <div className={overlayClasses.mainStatementWrapper}>
                <div className={overlayClasses.statementExpressionWrapper}>
                    <EditorPane
                        currentModel={currentModel}
                        label={label}
                        currentModelHandler={currentModelHandler}
                    />
                </div>
                <div className={overlayClasses.statementBtnWrapper}>
                    <div className={overlayClasses.bottomPane}>
                        <div className={overlayClasses.buttonWrapper}>
                            <SecondaryButton
                                text={cancelVariableButtonText}
                                fullWidth={false}
                                onClick={onCancelClick}
                            />
                            <PrimaryButton
                                dataTestId="save-btn"
                                text={saveVariableButtonText}
                                disabled={!isStatementValid}
                                fullWidth={false}
                                onClick={onSaveClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

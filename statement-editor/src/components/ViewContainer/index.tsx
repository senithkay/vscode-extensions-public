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

import { StatementEditorContext } from "../../store/statement-editor-context";
import { StatementEditorWrapperContext } from "../../store/statement-editor-wrapper-context";
import { getModifications } from "../../utils";
import { sendDidChange, sendDidClose } from "../../utils/ls-utils";
import { EditorPane } from '../EditorPane';
import { useStatementEditorStyles } from "../styles";

export interface ViewContainerProps {
    formArgs: any;
    isStatementValid: boolean;
    isConfigurableStmt: boolean;
    onWizardClose: () => void;
    onCancel: () => void;
}

export function ViewContainer(props: ViewContainerProps) {
    const {
        formArgs,
        isStatementValid,
        isConfigurableStmt,
        onWizardClose,
        onCancel
    } = props;
    const intl = useIntl();
    const overlayClasses = useStatementEditorStyles();
    const { currentFile, config, applyModifications, getLangClient } = useContext(StatementEditorWrapperContext);
    const {
        editorCtx: {
            dropLastEditor
        },
        syntaxTree
    } = useContext(StatementEditorWrapperContext);
    const {
        modelCtx: {
            statementModel
        },
        modules: {
            modulesToBeImported
        }
    } =  useContext(StatementEditorContext);
    const exprSchemeURI = `expr://${currentFile.path}`;
    const fileSchemeURI = `file://${currentFile.path}`;

    const saveButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.statementEditor.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.statementEditor.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const addConfigurableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.statementEditor.addConfigurableButton.text",
        defaultMessage: "Add"
    });

    const backButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.statementEditor.backButton.text",
        defaultMessage: "Back"
    });

    const onSaveClick = async () => {
        await handleModifications();
        onWizardClose();
        await sendDidClose(fileSchemeURI, getLangClient);
    };

    const onAddConfigurableClick = async () => {
        await handleModifications();
        dropLastEditor();
        await sendDidClose(fileSchemeURI, getLangClient);
    };

    const onBackClick = async () => {
        await handleClose();
        dropLastEditor();
    };

    const onCancelClick = async () => {
        await handleClose();
        onCancel();
    };

    const handleModifications = async () => {
        await sendDidClose(exprSchemeURI, getLangClient);
        await sendDidChange(fileSchemeURI, currentFile.content, getLangClient);
        const modifications = getModifications(statementModel, config, formArgs,
            syntaxTree, Array.from(modulesToBeImported) as string[]);
        applyModifications(modifications);
    };

    const handleClose = async () => {
        await sendDidChange(exprSchemeURI, currentFile.content, getLangClient);
        await sendDidClose(exprSchemeURI, getLangClient);
    };

    return (
        (
            <div className={overlayClasses.mainStatementWrapper}>
                <div className={overlayClasses.statementExpressionWrapper}>
                    <EditorPane />
                </div>
                <div className={overlayClasses.statementBtnWrapper}>
                    <div className={overlayClasses.bottomPane}>
                        <div className={overlayClasses.buttonWrapper}>
                            <SecondaryButton
                                text={isConfigurableStmt ? backButtonText : cancelButtonText}
                                fullWidth={false}
                                onClick={isConfigurableStmt ? onBackClick : onCancelClick}
                            />
                            <PrimaryButton
                                dataTestId="save-btn"
                                text={isConfigurableStmt ? addConfigurableButtonText : saveButtonText}
                                disabled={!isStatementValid}
                                fullWidth={false}
                                onClick={isConfigurableStmt ? onAddConfigurableClick : onSaveClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    )
}

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
    SecondaryButton,
    StatementEditorButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModuleVarDecl } from "@wso2-enterprise/syntax-tree";

import { EditorModel } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { getModifications } from "../../utils";
import { sendDidChange, sendDidClose } from "../../utils/ls-utils";
import Breadcrumb from "../Breadcrumb";
import { CloseButton } from "../Button/CloseButton";
import { EditorPane } from '../EditorPane';
import { useStatementEditorStyles } from "../styles";

export interface ViewContainerProps {
    isStatementValid: boolean;
    isConfigurableStmt: boolean;
}

export function ViewContainer(props: ViewContainerProps) {
    const {
        isStatementValid,
        isConfigurableStmt
    } = props;
    const intl = useIntl();
    const overlayClasses = useStatementEditorStyles();
    const {
        currentFile,
        config,
        applyModifications,
        getLangClient,
        onCancel,
        onWizardClose
    } = useContext(StatementEditorContext);
    const {
        modelCtx: {
            statementModel
        },
        modules: {
            modulesToBeImported
        },
        editorCtx: {
            editors,
            dropLastEditor,
            updateEditor,
            activeEditorId
        },
        targetPosition,
        experimentalEnabled,
        handleStmtEditorToggle
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

        const model = statementModel as ModuleVarDecl;

        const noOfLines = editors[activeEditorId].isExistingStmt ? 0 : model.source.split('\n').length;
        const nextEditor: EditorModel = editors[activeEditorId - 1];

        updateEditor(activeEditorId - 1, {
            ...nextEditor,
            newConfigurableName : model.typedBindingPattern.bindingPattern.source
        });

        dropLastEditor(noOfLines);
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
        const imports = Array.from(modulesToBeImported) as string[];
        const modifications = getModifications(statementModel, config.type, targetPosition, imports);
        applyModifications(modifications);
    };

    const handleClose = async () => {
        await sendDidChange(exprSchemeURI, currentFile.content, getLangClient);
        await sendDidClose(exprSchemeURI, getLangClient);
    };

    return (
        (
            <div className={overlayClasses.mainStatementWrapper} data-testid="statement-editor">
                <div className={overlayClasses.statementEditorHeader}>
                    <Breadcrumb/>
                    <div className={overlayClasses.closeButton} data-testid="close-btn">
                        {onCancel && <CloseButton onCancel={onCancel} />}
                    </div>
                </div>
                <div
                    className={`${overlayClasses.statementExpressionWrapper} ${
                        activeEditorId !== editors.length - 1 && 'overlay'}`
                    }
                >
                    <EditorPane data-testid="editor-pane"/>
                </div>
                <div className={overlayClasses.footer}>
                    <div className={overlayClasses.stmtEditorToggle}>
                        {experimentalEnabled && (
                            <StatementEditorButton
                                handleChange={handleStmtEditorToggle}
                                checked={true}
                                disabled={editors.length > 1}
                            />
                        )}
                    </div>
                    <div className={overlayClasses.buttonWrapper}>
                        <SecondaryButton
                            text={isConfigurableStmt ? backButtonText : cancelButtonText}
                            disabled={activeEditorId !== editors.length - 1}
                            fullWidth={false}
                            onClick={isConfigurableStmt ? onBackClick : onCancelClick}
                            dataTestId="cancel-btn"
                        />
                        <PrimaryButton
                            dataTestId="save-btn"
                            text={isConfigurableStmt ? addConfigurableButtonText : saveButtonText}
                            disabled={!isStatementValid || activeEditorId !== editors.length - 1}
                            fullWidth={false}
                            onClick={isConfigurableStmt ? onAddConfigurableClick : onSaveClick}
                        />
                    </div>
                </div>
            </div>
        )
    )
}

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
    SecondaryButton} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ModuleVarDecl, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Uri } from 'monaco-editor';

import { EditorModel } from "../../models/definitions";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { CONF_NAME_PLACEHOLDER } from '../../utils/expressions';
import { sendDidChange } from "../../utils/ls-utils";
import Breadcrumb from "../Breadcrumb";
import { CloseButton } from "../Button/CloseButton";
import { EditorOverlay, OverlayType } from '../EditorOverlay';
import { EditorPane } from '../EditorPane';
import { Help } from "../Help";
import { useStatementEditorStyles } from "../styles";

export interface ViewContainerProps {
    isStatementValid: boolean;
    isConfigurableStmt: boolean;
    isPullingModule: boolean;
    isDisableEditor: boolean;
    isHeaderHidden?: boolean;
}

export function ViewContainer(props: ViewContainerProps) {
    const {
        isStatementValid,
        isConfigurableStmt,
        isPullingModule,
        isDisableEditor,
        isHeaderHidden
    } = props;
    const intl = useIntl();
    const overlayClasses = useStatementEditorStyles();
    const {
        currentFile,
        applyModifications,
        getLangClient,
        onCancel,
        onWizardClose,
        modelCtx: {
            statementModel,
            editing
        },
        editorCtx: {
            editors,
            dropLastEditor,
            updateEditor,
            activeEditorId
        },
        syntaxTree,
        isCodeServerInstance
    } = useContext(StatementEditorContext);
    const fileSchemeURI = Uri.file(currentFile.path).toString();
    const hasConfPlaceholder = isConfigurableStmt &&
                               statementModel?.typedBindingPattern?.bindingPattern?.variableName?.value === CONF_NAME_PLACEHOLDER;

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
    };

    const onAddConfigurableClick = async () => {
        await handleModifications();

        const model = statementModel as ModuleVarDecl;
        const configurablesAvailable = STKindChecker.isModulePart(syntaxTree) && STKindChecker.isModuleVarDecl(syntaxTree.members[0])
            && STKindChecker.isConfigurableKeyword(syntaxTree.members[0].qualifiers[0]);

        const noOfLines = editors[activeEditorId].isExistingStmt
            ? 0
            : STKindChecker.isModulePart(syntaxTree) && !!syntaxTree.imports.length
                ? configurablesAvailable
                    ? model.source.split('\n').length - 1
                    : model.source.split('\n').length
                : 1;
        const nextEditor: EditorModel = editors[activeEditorId - 1];

        updateEditor(activeEditorId - 1, {
            ...nextEditor,
            newConfigurableName: model.typedBindingPattern.bindingPattern.source
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
        if (statementModel) {
            await sendDidChange(fileSchemeURI, currentFile.draftSource, getLangClient);
            // HACK: trigger apply modification with space to re draw diagram and code formatting
            applyModifications([
                {
                    "startLine": 0,
                    "startColumn": 0,
                    "endLine": 0,
                    "endColumn": 0,
                    "type": "INSERT",
                    "isImport": false,
                    "config": {
                        "STATEMENT": "  "
                    }
                }

            ]);
        }
    };

    const handleClose = async () => {
        onWizardClose();
    };

    return (
        (
            <div className={overlayClasses.mainStatementWrapper} data-testid="statement-editor">
                {!isHeaderHidden && (
                    <div className={overlayClasses.statementEditorHeader}>
                        <Breadcrumb />
                        {isCodeServerInstance && <Help />}
                        <div className={overlayClasses.closeButton} data-testid="close-btn">
                            {onCancel && <CloseButton onCancel={onCancel} />}
                        </div>
                    </div>
                )
                }
                {isDisableEditor && (
                    <EditorOverlay type={OverlayType.Disabled}/>
                )}
                {isPullingModule && !isDisableEditor && (
                    <EditorOverlay type={OverlayType.ModulePulling}/>
                )}
                {!isPullingModule && !isDisableEditor && (
                    <>
                        <div
                            className={`${overlayClasses.statementExpressionWrapper} ${activeEditorId !== editors.length - 1 && "overlay"
                                }`}
                        >
                            <EditorPane data-testid="editor-pane" />
                        </div>
                        <div className={overlayClasses.footer}>
                            <div className={overlayClasses.buttonWrapper}>
                                <SecondaryButton
                                    text={activeEditorId !== 0 && isConfigurableStmt ? backButtonText : cancelButtonText}
                                    disabled={activeEditorId !== editors.length - 1}
                                    fullWidth={false}
                                    onClick={activeEditorId !== 0 && isConfigurableStmt ? onBackClick : onCancelClick}
                                    dataTestId="cancel-btn"
                                />
                                <PrimaryButton
                                    dataTestId="save-btn"
                                    text={
                                        activeEditorId !== 0 && isConfigurableStmt
                                            ? addConfigurableButtonText
                                            : saveButtonText
                                    }
                                    disabled={!isStatementValid || activeEditorId !== editors.length - 1 || hasConfPlaceholder || editing}
                                    fullWidth={false}
                                    onClick={
                                        activeEditorId !== 0 && isConfigurableStmt ? onAddConfigurableClick : onSaveClick
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    )
}

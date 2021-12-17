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

import {
    ExpressionEditorLangClientInterface, LibraryDocResponse,
    PrimaryButton,
    SecondaryButton,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { VariableUserInputs } from '../../models/definitions';
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import { getCurrentModel, getModifications } from "../../utils";
import { getPartialSTForStatement, sendDidChange } from "../../utils/ls-utils";
import { LeftPane } from '../LeftPane';
import { useStatementEditorStyles } from "../styles";

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>,
    applyModifications: (modifications: STModification[]) => void,
    getLibrariesList: (version: string) => Promise<LibraryDocResponse>,
    currentFile: {
        content: string,
        path: string,
        size: number
    };
}
export interface ViewProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    formArgs: any;
    userInputs?: VariableUserInputs;
    config: {
        type: string;
        model?: STNode;
    }
    validForm?: boolean;
    onWizardClose: () => void;
    onCancel: () => void;
    handleNameOnChange?: (name: string) => void;
    handleTypeChange?: (name: string) => void;
    handleStatementEditorChange?: (partialModel: STNode) => void,
}

export function ViewContainer(props: ViewProps) {
    const {
        label,
        initialSource,
        formArgs,
        userInputs,
        config,
        onCancel,
        onWizardClose,
        handleNameOnChange,
        handleTypeChange,
        handleStatementEditorChange,
        getLangClient,
        applyModifications,
        getLibrariesList,
        currentFile
    } = props;
    const intl = useIntl();
    const overlayClasses = useStatementEditorStyles();

    const [model, setModel] = useState<STNode>(null);
    const [isStatementValid, setIsStatementValid] = useState(false);
    const [currentModel, setCurrentModel] = useState({ model });
    const fileURI = `expr://${currentFile.path}`;

    if (!userInputs?.varName && !!handleNameOnChange) {
        handleNameOnChange("default")
    }

    useEffect(() => {
        (async () => {
            let partialST: STNode = await getPartialSTForStatement(
                { codeSnippet: initialSource.trim() }, getLangClient);
            if (STKindChecker.isLocalVarDecl(partialST) && !partialST.equalsToken) {
                partialST = await getPartialSTForStatement(
                    { codeSnippet: initialSource.trim() + " = EXPRESSION" }, getLangClient);
            }
            setModel(partialST);
        })();
    }, []);

    useEffect(() => {
        if (!!model && STKindChecker.isLocalVarDecl(model) && handleNameOnChange && handleTypeChange) {
            handleNameOnChange(model.typedBindingPattern.bindingPattern.source)
            handleTypeChange(model.typedBindingPattern.typeDescriptor.source)
        }
    }, [model]);

    const updateModel = async (codeSnippet: string, position: NodePosition) => {
        const stModification = {
            startLine: position.startLine,
            startColumn: position.startColumn,
            endLine: position.endLine,
            endColumn: position.endColumn,
            newCodeSnippet: codeSnippet
        }
        const partialST: STNode = await getPartialSTForStatement(
            { codeSnippet: model.source, stModification }, getLangClient);
        setModel(partialST);

        const newCurrentModel = getCurrentModel({
            ...position,
            endColumn: position.startColumn + codeSnippet.length
        }, partialST);
        setCurrentModel({model: newCurrentModel});
    }

    const currentModelHandler = (cModel: STNode) => {
        setCurrentModel({
            model: cModel
        });
    };

    useEffect(() => {
        if (!!model) {
            handleStatementEditorChange(model);
        }
    }, [model])

    const validateStatement = (isValid: boolean) => {
        setIsStatementValid(isValid);
    };

    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const onSaveClick = () => {
        const modifications = getModifications(model, config, formArgs);
        applyModifications(modifications);
        onWizardClose();
    };

    const onCancelClick = async () => {
        await sendDidChange(fileURI, currentFile.content, getLangClient);
        onCancel();
    }

    return (
        model && (
            <div className={overlayClasses.mainStatementWrapper}>
                <div className={overlayClasses.statementExpressionWrapper}>
                    <StatementEditorContextProvider
                        model={model}
                        currentModel={currentModel}
                        updateModel={updateModel}
                        formArgs={formArgs}
                        validateStatement={validateStatement}
                        applyModifications={applyModifications}
                        getLibrariesList={getLibrariesList}
                        currentFile={currentFile}
                        getLangClient={getLangClient}
                    >
                        <LeftPane
                            currentModel={currentModel}
                            label={label}
                            userInputs={userInputs}
                            currentModelHandler={currentModelHandler}
                        />
                    </StatementEditorContextProvider>
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

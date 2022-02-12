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
    ExpressionEditorLangClientInterface,
    LibraryDataResponse,
    LibraryDocResponse,
    LibraryKind,
    LibrarySearchResponse,
    PrimaryButton,
    SecondaryButton,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { APPEND_EXPR_LIST_CONSTRUCTOR, INIT_EXPR_LIST_CONSTRUCTOR, OTHER_STATEMENT } from "../../constants";
import { VariableUserInputs } from '../../models/definitions';
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import { getCurrentModel, getModifications } from "../../utils";
import { getPartialSTForStatement, sendDidChange } from "../../utils/ls-utils";
import { LeftPane } from '../LeftPane';
import { useStatementEditorStyles } from "../styles";

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    library: {
        getLibrariesList: (kind: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    experimentalEnabled?: boolean;
}
export interface ViewProps extends LowCodeEditorProps {
    label: string;
    initialSource: string;
    formArgs: any;
    userInputs?: VariableUserInputs;
    config: {
        type: string;
        model?: STNode;
    };
    validForm?: boolean;
    onWizardClose: () => void;
    onCancel: () => void;
    handleNameOnChange?: (name: string) => void;
    handleTypeChange?: (name: string) => void;
    handleStatementEditorChange?: (partialModel: STNode) => void;
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
        library,
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
        if (!(config.type === "Custom") || initialSource) {
            (async () => {
                const partialST = await getPartialSTForStatement(
                    { codeSnippet: initialSource.trim() }, getLangClient);
                setModel(partialST);
            })();
        }
    }, []);

    useEffect(() => {
        if (!!model && STKindChecker.isLocalVarDecl(model) && handleNameOnChange && handleTypeChange) {
            handleNameOnChange(model.typedBindingPattern.bindingPattern.source)
            handleTypeChange(model.typedBindingPattern.typeDescriptor.source)
        }
    }, [model]);

    const updateModel = async (codeSnippet: string, position: NodePosition) => {
        let partialST: STNode;
        if (model) {
            const stModification = {
                startLine: position.startLine,
                startColumn: position.startColumn,
                endLine: position.endLine,
                endColumn: position.endColumn,
                newCodeSnippet: codeSnippet
            }
            partialST = await getPartialSTForStatement(
                { codeSnippet: model.source , stModification }, getLangClient);
        } else {
            partialST = await getPartialSTForStatement(
                { codeSnippet }, getLangClient);
        }
        setModel(partialST);

        // Since in list constructor we add expression with comma and close-bracket,
        // we need to reduce that length from the code snippet to get the correct current model
        let currentModelPosition: NodePosition;
        if (currentModel.model && STKindChecker.isListConstructor(currentModel.model) && codeSnippet === INIT_EXPR_LIST_CONSTRUCTOR) {
            currentModelPosition = {
                ...position,
                endColumn: position.startColumn + codeSnippet.length - 1
            };
        } else if (currentModel.model && codeSnippet === APPEND_EXPR_LIST_CONSTRUCTOR){
            currentModelPosition = {
                ...position,
                startColumn: position.startColumn + 2,
                endColumn: position.startColumn + codeSnippet.length - 1
            }
        } else {
            currentModelPosition = {
                ...position,
                endColumn: position.startColumn + codeSnippet.length
            };
        }

        const newCurrentModel = getCurrentModel(currentModelPosition, partialST);
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
        (
            <div className={overlayClasses.mainStatementWrapper}>
                <div className={overlayClasses.statementExpressionWrapper}>
                    <StatementEditorContextProvider
                        model={model}
                        currentModel={currentModel}
                        updateModel={updateModel}
                        formArgs={formArgs}
                        validateStatement={validateStatement}
                        applyModifications={applyModifications}
                        library={library}
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

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

import {
    ExpressionEditorLangClientInterface,
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { APPEND_EXPR_LIST_CONSTRUCTOR, CUSTOM_CONFIG_TYPE, INIT_EXPR_LIST_CONSTRUCTOR } from "../../constants";
import { VariableUserInputs } from '../../models/definitions';
import { StatementEditorContextProvider } from "../../store/statement-editor-context";
import { getCurrentModel } from "../../utils";
import { getPartialSTForStatement } from "../../utils/ls-utils";
import { StmtEditorUndoRedoManager } from '../../utils/undo-redo';
import { ViewContainer } from "../ViewContainer";

export interface LowCodeEditorProps {
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    library: {
        getLibrariesList: (kind?: string) => Promise<LibraryDocResponse>;
        getLibrariesData: () => Promise<LibrarySearchResponse>;
        getLibraryData: (orgName: string, moduleName: string, version: string) => Promise<LibraryDataResponse>;
    };
    importStatements: string[];
    experimentalEnabled?: boolean;
}
export interface StatementEditorProps extends LowCodeEditorProps {
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
    onStmtEditorModelChange?: (partialModel: STNode) => void;
}

export function StatementEditor(props: StatementEditorProps) {
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
        onStmtEditorModelChange,
        getLangClient,
        applyModifications,
        library,
        currentFile,
        importStatements
    } = props;

    const [model, setModel] = useState<STNode>(null);
    const [isStatementValid, setIsStatementValid] = useState(false);
    const [currentModel, setCurrentModel] = useState({ model });

    const undoRedoManager = React.useMemo(() => new StmtEditorUndoRedoManager(), []);

    const undo = React.useCallback(() => {
        const undoItem = undoRedoManager.getUndoModel();
        if (undoItem) {
            setModel(undoItem.oldModel);
        }
    }, []);

    const redo = React.useCallback(() => {
        const redoItem = undoRedoManager.getRedoModel();
        if (redoItem) {
            setModel(redoItem.newModel);
        }
    }, []);

    useEffect(() => {
        if (!(config.type === CUSTOM_CONFIG_TYPE) || initialSource) {
            (async () => {
                const partialST = await getPartialSTForStatement(
                    { codeSnippet: initialSource.trim() }, getLangClient);

                if (partialST.syntaxDiagnostics.length === 0) {
                    setModel(partialST);
                }
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

        undoRedoManager.add(model, partialST);

        if (partialST.syntaxDiagnostics.length === 0 || config.type === CUSTOM_CONFIG_TYPE) {
            setModel(partialST);
        }

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
            onStmtEditorModelChange(model);
        }
    }, [model])

    const validateStatement = (isValid: boolean) => {
        setIsStatementValid(isValid);
    };

    return (
        (
            <>
                <StatementEditorContextProvider
                    model={model}
                    currentModel={currentModel}
                    importStatements={importStatements}
                    updateModel={updateModel}
                    formArgs={formArgs}
                    validateStatement={validateStatement}
                    applyModifications={applyModifications}
                    library={library}
                    currentFile={currentFile}
                    getLangClient={getLangClient}
                    initialSource={initialSource}
                    undo={undo}
                    redo={redo}
                    hasRedo={undoRedoManager.hasRedo()}
                    hasUndo={undoRedoManager.hasUndo()}
                >
                    <ViewContainer
                        label={label}
                        formArgs={formArgs}
                        userInputs={userInputs}
                        config={config}
                        isStatementValid={isStatementValid}
                        currentModelHandler={currentModelHandler}
                        onWizardClose={onWizardClose}
                        onCancel={onCancel}
                    />
                </StatementEditorContextProvider>
            </>
        )
    )
}

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
import React, { useContext } from 'react';

import { FormControl } from "@material-ui/core";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { NodePosition, RecordTypeDesc, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { createPropertyStatement } from "../../../../utils";
import { UndoRedoManager } from "../../UndoRedoManager";
import { wizardStyles } from "../style";

import { CreateRecord } from "./CreateRecord";
import { RecordModel } from "./types";

export interface RecordEditorProps {
    name: string;
    model?: RecordTypeDesc | TypeDefinition;
    targetPosition?: NodePosition;
    formType: string;
    isTypeDefinition?: boolean;
    isDataMapper?: boolean;
    onCancel: (createdNewRecord?: string) => void;
    onSave: (typeDesc: string, recModel: RecordModel) => void;
}

const undoRedoManager = new UndoRedoManager();

export function RecordEditor(props: RecordEditorProps) {
    const { onCancel, model, targetPosition, formType, isDataMapper } = props;

    const overlayClasses = wizardStyles();

    const {
        props: {
            stSymbolInfo,
            currentFile,
            syntaxTree,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram,
                updateFileContent
            },
            library
        }
    } = useContext(Context);

    const getStatementEditor = () => {
        return StatementEditorWrapper(
            {
                label: 'Record',
                initialSource: model?.source,
                formArgs: {
                    formArgs: {
                        targetPosition: model ? targetPosition : { startLine: targetPosition.startLine, startColumn: targetPosition.startColumn }
                    }},
                config: { type: formType, model},
                onWizardClose: onCancel,
                onCancel,
                currentFile,
                getLangClient: getExpressionEditorLangClient,
                applyModifications: modifyDiagram,
                updateFileContent,
                library,
                syntaxTree,
                stSymbolInfo,
                importStatements,
                experimentalEnabled,
                isModuleVar: true
            }
        );
    }

    const createModelSave = (recordString: string, pos: NodePosition) => {
        undoRedoManager.updateContent(currentFile.path, currentFile.content);
        undoRedoManager.addModification(currentFile.content);
        modifyDiagram([
            createPropertyStatement(recordString, targetPosition, false)
        ]);
        if (isDataMapper) {
            onCancel(recordString);
        }
    }

    return (
        <>
            {model ? (
                // Edit existing record
                <FormControl data-testid="record-form" className={overlayClasses.wizardFormControlExtended}>
                    {getStatementEditor()}
                </FormControl>
            ) : (
                // Create new record
                <CreateRecord
                    onCancel={onCancel}
                    onSave={createModelSave}
                    targetPosition={targetPosition}
                    isDataMapper={isDataMapper}
                    undoRedoManager={undoRedoManager}
                />
            )}
        </>
    );
}

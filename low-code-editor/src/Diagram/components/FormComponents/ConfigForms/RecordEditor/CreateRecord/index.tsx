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
import React, { useContext, useState } from "react";

import { FormControl } from "@material-ui/core";
import { getAllVariables } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { getInitialSource, mutateTypeDefinition } from "../../../../../utils";
import { genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../style";
import { RecordConfigTypeSelector } from "../RecordConfigTypeSelector";
import { RecordFromJson } from "../RecordFromJson";

enum ConfigState {
    STATE_SELECTOR,
    EDIT_CREATED,
    CREATE_FROM_SCRATCH,
    IMPORT_FROM_JSON
}

export interface CreateRecordProps {
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: (recordString: string, modifiedPosition: NodePosition) => void;
}

export function CreateRecord(props: CreateRecordProps) {
    const { targetPosition, onSave, onCancel } = props;

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
                modifyDiagram
            },
            library
        }
    } = useContext(Context);

    const [editorState, setEditorState] = useState<ConfigState>(ConfigState.STATE_SELECTOR);
    const overlayClasses = wizardStyles();

    const handleCreateNewClick = () => {
        setEditorState(ConfigState.CREATE_FROM_SCRATCH);
    };

    const handleImportJSONClick = () => {
        setEditorState(ConfigState.IMPORT_FROM_JSON);
    };

    const handleBackClick = () => {
        setEditorState(ConfigState.STATE_SELECTOR);
    };

    const handleImportJsonSave = (value: string, pos: NodePosition) => {
        onSave(value, pos);
    };

    const statementEditor = (
        StatementEditorWrapper(
            {
                label: 'Record',
                initialSource: getInitialSource(mutateTypeDefinition(genVariableName("Record",
                    getAllVariables(stSymbolInfo), true), "record {};", targetPosition, true)),
                formArgs: {
                    formArgs: {
                        targetPosition: { startLine: targetPosition.startLine, startColumn: targetPosition.startColumn }
                    }
                },
                config: { type: "RecordEditor" },
                onWizardClose: handleBackClick,
                onCancel: handleBackClick,
                currentFile,
                getLangClient: getExpressionEditorLangClient,
                applyModifications: modifyDiagram,
                library,
                syntaxTree,
                stSymbolInfo,
                importStatements,
                experimentalEnabled,
                isModuleVar: true
            }
        )
    )

    return (
        <FormControl data-testid="record-form" className={overlayClasses.wizardFormControlExtended}>
            <>
                {(editorState === ConfigState.STATE_SELECTOR) && (
                    <RecordConfigTypeSelector
                        onImportFromJson={handleImportJSONClick}
                        onCreateNew={handleCreateNewClick}
                        onCancel={onCancel}
                    />
                )}
                {(editorState === ConfigState.IMPORT_FROM_JSON) && (
                    <RecordFromJson
                        targetPosition={targetPosition}
                        onCancel={handleBackClick}
                        onSave={handleImportJsonSave}
                    />
                )}
                {(editorState === ConfigState.CREATE_FROM_SCRATCH) && (
                    <>
                        {statementEditor}
                    </>
                )}
            </>
        </FormControl>
    )
}

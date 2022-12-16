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
import React, {useState} from "react";

import FormControl from "@material-ui/core/FormControl/FormControl";
import { default as AddIcon } from "@material-ui/icons/Add";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    LibraryDataResponse,
    LibraryDocResponse,
    LibrarySearchResponse,
    STModification
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FormHeaderSection,
    LinePrimaryButton,
    Panel,
    PrimaryButton,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorComponent } from "../../../StatementEditorComponent/StatementEditorComponent";

import { useStyles } from "./style";

enum PanelState {
    STATE_SELECTOR,
    EDIT_CREATED,
    CREATE_VARIABLE
}


export interface LocalVarConfigPanelProps {
    langClientPromise: Promise<IBallerinaLangClient>;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    updateFileContent: (content: string, skipForceSave?: boolean) => Promise<boolean>;
    currentFile?: {
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
    cancelStatementEditor: () => void;
    closeStatementEditor: () => void;
    handleLocalVarConfigPanel: (showPanel: boolean) => void;
    fnDef: STNode;
}

export function LocalVarConfigPanel(props: LocalVarConfigPanelProps) {
    const {
        langClientPromise,
        handleLocalVarConfigPanel,
        applyModifications,
        updateFileContent,
        currentFile,
        library,
        importStatements,
        cancelStatementEditor,
        closeStatementEditor,
        fnDef
    } = props;

    const [panelState, setPanelState] = useState<PanelState>(PanelState.STATE_SELECTOR);

    const formClasses = useFormStyles();
    const overlayClasses = useStyles();

    const onCancel = () => {
        handleLocalVarConfigPanel(false);
    };

    const onAddNewVar = () => {
        setPanelState(PanelState.CREATE_VARIABLE);
    };

    const getLetExprAddPosition = (): NodePosition => {
        let addPosition: NodePosition;
        if (STKindChecker.isFunctionDefinition(fnDef) && STKindChecker.isExpressionFunctionBody(fnDef.functionBody)) {
            if (STKindChecker.isLetExpression(fnDef.functionBody.expression)) {
                addPosition = {
                    ...fnDef.functionBody.expression,
                    endLine: fnDef.functionBody.expression.position.startLine,
                    endColumn: fnDef.functionBody.expression.position.startColumn
                }
            } else {
                addPosition = {
                    ...fnDef.functionBody.expression.position,
                    endLine: fnDef.functionBody.expression.position.startLine,
                    endColumn: fnDef.functionBody.expression.position.startColumn
                }
            }
        }

        return addPosition;
    };

    return (
        <Panel onClose={onCancel}>
            <FormControl
                variant="outlined"
                data-testid="data-mapper-form"
                className={formClasses.wizardFormControlExtended}
            >
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.DataMapper.localVarConfigTitle"}
                    defaultMessage={"Data Mapper"}
                />
                <div className={overlayClasses.recordFormWrapper}>
                    <div className={overlayClasses.createButtonWrapper}>
                        <LinePrimaryButton
                            text={"Add New"}
                            fullWidth={true}
                            onClick={onAddNewVar}
                            dataTestId="create-new-btn"
                            startIcon={<AddIcon />}
                        />
                    </div>
                </div>
                {panelState === PanelState.CREATE_VARIABLE && (
                    <StatementEditorComponent
                        expressionInfo={{
                            value: `let var variable = "" in `,
                            valuePosition: getLetExprAddPosition()
                        }}
                        langClientPromise={langClientPromise}
                        applyModifications={applyModifications}
                        updateFileContent={updateFileContent}
                        currentFile={currentFile}
                        library={library}
                        onCancel={cancelStatementEditor}
                        onClose={closeStatementEditor}
                        importStatements={importStatements}
                    />
                )}
                <div className={overlayClasses.doneButtonWrapper}>
                    <PrimaryButton
                        dataTestId="done-btn"
                        text={"Done"}
                        fullWidth={false}
                        onClick={onCancel}
                    />
                </div>
            </FormControl>
        </Panel>
    );
}

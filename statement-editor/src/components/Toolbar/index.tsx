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
import React, { useContext, useEffect, useMemo } from "react";

import IconButton from "@material-ui/core/IconButton";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import ToolbarConfigurableIcon from "../../assets/icons/ToolbarConfigurableIcon";
import ToolbarDeleteIcon from "../../assets/icons/ToolbarDeleteIcon";
import ToolbarDocumentationIcon from "../../assets/icons/ToolbarDocumentationIcon";
import ToolbarRedoIcon from "../../assets/icons/ToolbarRedoIcon";
import ToolbarUndoIcon from "../../assets/icons/ToolbarUndoIcon";
import {
    ADD_CONFIGURABLE_LABEL,
    CONFIGURABLE_NAME_CONSTRUCTOR,
    CONFIGURABLE_TYPE_BOOLEAN,
    CONFIGURABLE_TYPE_STRING
} from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import {
    getExistingConfigurable,
    getModuleElementDeclPosition,
    getRemainingContent,
    isConfigAllowedTypeDesc,
    isNodeDeletable
} from "../../utils";
import { KeyboardNavigationManager } from "../../utils/keyboard-navigation-manager";
import { ModelType, StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementEditorToolbarStyles } from "../styles";

interface ToolbarProps {
    inlineDocumentHandler: (docBtnEnabled: boolean) => void
}

export default function Toolbar(props: ToolbarProps) {
    const statementEditorClasses = useStatementEditorToolbarStyles();
    const {  modelCtx, editorCtx, syntaxTree, stSymbolInfo } = useContext(StatementEditorContext);
    const {
        undo,
        redo,
        hasRedo,
        hasUndo,
        statementModel: completeModel,
        updateModel,
        currentModel,
        hasSyntaxDiagnostics
    } = modelCtx;
    const {
        editors,
        updateEditor,
        addConfigurable,
        activeEditorId
    } = editorCtx;
    const { inlineDocumentHandler } = props;
    const [docEnabled, setDocEnabled] = React.useState(false);

    const keyboardNavigationManager = new KeyboardNavigationManager()
    React.useEffect(() => {
        const client = keyboardNavigationManager.getClient();
        keyboardNavigationManager.bindNewKey(client, ['command+z', 'ctrl+z'], undo);
        keyboardNavigationManager.bindNewKey(client, ['command+shift+z', 'ctrl+shift+z'], redo)
        keyboardNavigationManager.bindNewKey(client, ['del'], onDelFunction)

        return () => {
            keyboardNavigationManager.resetMouseTrapInstance(client)
        }
    }, [currentModel]);

    const [deletable, configurable] = useMemo(() => {
        let modelDeletable = false;
        let modelConfigurable = false;

        if (currentModel.model) {
            modelDeletable = isNodeDeletable(currentModel.model);
            modelConfigurable = (currentModel.model.viewState as StatementEditorViewState).modelType === ModelType.EXPRESSION;
        }

        return [modelDeletable, modelConfigurable]
    }, [currentModel.model]);

    const onDelFunction = () => {
        if (!!currentModel.model && deletable){
            onClickOnDelete();
        }
    }

    const onClickOnDelete = () => {
        const {
            code: newCode,
            position: newPosition
        } = getRemainingContent(currentModel.model.position, completeModel);
        updateModel(newCode, newPosition);
    }

    const onClickOnConfigurable = () => {
        updateEditor(activeEditorId, {
            ...editors[activeEditorId],
            model: completeModel,
            source: completeModel.source,
            selectedNodePosition: currentModel.model.position
        });
        const existingConfigurable = getExistingConfigurable(currentModel.model, stSymbolInfo);
        if (existingConfigurable) {
            editExistingConfigurable(existingConfigurable);
        } else {
            createNewConfigurable();
        }
    }

    const createNewConfigurable = () => {
        const configurableInsertPosition = getModuleElementDeclPosition(syntaxTree);
        // TODO: Use the expected type provided by the LS, once it is available
        //  (https://github.com/wso2-enterprise/internal-support-ballerina/issues/112)
        const configurableType = CONFIGURABLE_TYPE_STRING;

        const configurableStmt = `configurable ${configurableType} ${CONFIGURABLE_NAME_CONSTRUCTOR} = ?;`;

        addConfigurable(ADD_CONFIGURABLE_LABEL, configurableInsertPosition, configurableStmt);
    }

    const editExistingConfigurable = (confModel: STNode) => {
        const configurableInsertPosition = confModel.position;
        const configurableStmt = confModel.source;
        addConfigurable(ADD_CONFIGURABLE_LABEL, configurableInsertPosition, configurableStmt, true);
    }

    const onClickOnDocumentation = () => {
        docEnabled ? setDocEnabled(false) : setDocEnabled(true);
    }

    useEffect(() => {
        inlineDocumentHandler(docEnabled);
    }, [docEnabled])

    return (
        <div className={statementEditorClasses.toolbar} data-testid="toolbar">
            <div className={statementEditorClasses.toolbarSet}>
                <IconButton
                    onClick={undo}
                    disabled={!hasUndo}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-undo"
                >
                    <ToolbarUndoIcon />
                </IconButton>
                <div className={statementEditorClasses.undoRedoSeparator} />
                <IconButton
                    onClick={redo}
                    disabled={!hasRedo}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-redo"
                >
                    <ToolbarRedoIcon />
                </IconButton>
            </div>
            <div className={statementEditorClasses.toolbarSet}>
                <IconButton
                    onClick={onClickOnDelete}
                    disabled={!deletable}
                    style={{color: deletable ? '#FE523C' : '#8D91A3', padding: deletable && '10px'}}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-delete"
                >
                    <ToolbarDeleteIcon/>
                </IconButton>
            </div>
            <div className={statementEditorClasses.toolbarSet}>
                <IconButton
                    onClick={onClickOnConfigurable}
                    disabled={!configurable}
                    className={statementEditorClasses.toolbarIcons}
                >
                    <ToolbarConfigurableIcon/>
                </IconButton>
            </div>
            <div className={statementEditorClasses.toolbarSet}>
                <IconButton
                    onClick={onClickOnDocumentation}
                    style={docEnabled ? ({color : '#5567d5'}) : ({color: '#40404B'})}
                    className={statementEditorClasses.toolbarIcons}
                >
                    <ToolbarDocumentationIcon />
                </IconButton>

            </div>
        </div>
    );
}

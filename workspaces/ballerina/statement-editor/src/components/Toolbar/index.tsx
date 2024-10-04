/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useMemo } from "react";

import { genVariableName, getAllVariables, KeyboardNavigationManager } from "@wso2-enterprise/ballerina-core";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Button, Codicon, Divider, Icon } from "@wso2-enterprise/ui-toolkit";

import {
    ADD_CONFIGURABLE_LABEL,
    CALL_CONFIG_TYPE,
    CONFIGURABLE_TYPE_STRING,
    RECORD_EDITOR
} from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { ToolbarContext } from "../../store/toolbar-context";
import {
    getExistingConfigurable,
    getModuleElementDeclPosition,
    getRemainingContent,
    isNodeDeletable,
    isQualifierSupportedStatements
} from "../../utils";
import { ModelType, StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementEditorToolbarStyles } from "../styles";

import StatementQualifiers from "./StatementQualifiers";
import { ToolbarOperators } from "./ToolbarOperators";

export default function Toolbar() {
    const statementEditorClasses = useStatementEditorToolbarStyles();
    const {  modelCtx, editorCtx, syntaxTree, stSymbolInfo, config } = useContext(StatementEditorContext);
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
    const toolbarCtx = useContext(ToolbarContext);

    React.useEffect(() => {
        const client = KeyboardNavigationManager.getClient();
        client.bindNewKey(['command+z', 'ctrl+z'], undo);
        client.bindNewKey(['command+shift+z', 'ctrl+shift+z'], redo);
        client.bindNewKey(['del'], onDelFunction);

    }, [currentModel]);

    const [deletable, configurable] = useMemo(() => {
        let modelDeletable = false;
        let modelConfigurable = false;

        if (currentModel.model) {
            modelDeletable = isNodeDeletable(currentModel.model, config.type);
            modelConfigurable = (currentModel.model.viewState as StatementEditorViewState).modelType === ModelType.EXPRESSION;

            if (STKindChecker.isFunctionCall(currentModel.model) && config.type === CALL_CONFIG_TYPE) {
                modelConfigurable = false;
            }
            if (config.type === RECORD_EDITOR && STKindChecker.isTypeDefinition(currentModel.model.parent)) {
                modelConfigurable = false;
            }
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

        const confName = genVariableName('conf', getAllVariables(stSymbolInfo));
        const configurableStmt = `configurable ${configurableType} ${confName} = ?;`;

        addConfigurable(ADD_CONFIGURABLE_LABEL, configurableInsertPosition, configurableStmt);
    }

    const editExistingConfigurable = (confModel: STNode) => {
        const configurableInsertPosition = confModel.position;
        const configurableStmt = confModel.source;
        addConfigurable(ADD_CONFIGURABLE_LABEL, configurableInsertPosition, configurableStmt, true);
    }

    const onClickExpressions = () => {
        toolbarCtx.onClickMoreExp(true);
    }

    return (
        <div className={statementEditorClasses.toolbar} data-testid="toolbar">
            <Button
                appearance="icon"
                onClick={undo}
                disabled={!hasUndo}
                tooltip="Undo"
                className={statementEditorClasses.toolbarIcons}
                data-testid="toolbar-undo"
            >
                <Codicon name="discard" />
            </ Button>
            <Button
                appearance="icon"
                onClick={redo}
                disabled={!hasRedo}
                tooltip="Redo"
                className={statementEditorClasses.toolbarIcons}
                data-testid="toolbar-redo"
            >
                <Codicon name="redo" />
            </ Button>
            <Divider className={statementEditorClasses.toolbarDivider} />
            <Button
                appearance="icon"
                onClick={onClickOnDelete}
                disabled={!deletable}
                tooltip="Delete"
                className={statementEditorClasses.toolbarIcons}
                data-testid="toolbar-delete"
            >
                <Codicon sx={{color: "var(--vscode-editorGutter-deletedBackground)"}} name="trash" />
            </ Button>
            <Divider className={statementEditorClasses.toolbarDivider} />
            {(completeModel?.kind && isQualifierSupportedStatements(completeModel)) && (
                <>
                    <StatementQualifiers />
                    <Divider className={statementEditorClasses.toolbarDivider} />
                </>
            )}
            <ToolbarOperators />
            <Divider className={statementEditorClasses.toolbarDivider} />
            <Button
                appearance="icon"
                onClick={onClickExpressions}
                tooltip="More expressions"
                className={statementEditorClasses.toolbarIcons}
                data-testid="toolbar-expressions"
            >
                <div className={statementEditorClasses.toolbarMoreExpIcon}> More </div>
            </Button>
        </div>
    );
}

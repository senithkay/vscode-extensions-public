/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useMemo } from "react";

import { Divider, Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { genVariableName, getAllVariables, KeyboardNavigationManager } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorHint } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import ToolbarConfigurableIcon from "../../assets/icons/ToolbarConfigurableIcon";
import ToolbarDeleteIcon from "../../assets/icons/ToolbarDeleteIcon";
import ToolbarDocumentationIcon from "../../assets/icons/ToolbarDocumentationIcon";
import ToolbarRedoIcon from "../../assets/icons/ToolbarRedoIcon";
import ToolbarUndoIcon from "../../assets/icons/ToolbarUndoIcon";
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
            <StatementEditorHint content={"Undo"} disabled={!hasUndo} >
                <IconButton
                    onClick={undo}
                    disabled={!hasUndo}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-undo"
                >
                    <ToolbarUndoIcon />
                </IconButton>
            </StatementEditorHint>
            <StatementEditorHint content={"Redo"} disabled={!hasRedo} >
                <IconButton
                    onClick={redo}
                    disabled={!hasRedo}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-redo"
                >
                    <ToolbarRedoIcon />
                </IconButton>
            </StatementEditorHint>
            <Divider orientation="vertical" variant="middle" flexItem={true} className={statementEditorClasses.toolbarDivider}/>
            <StatementEditorHint content={"Delete"} disabled={!deletable} >
                <IconButton
                    onClick={onClickOnDelete}
                    disabled={!deletable}
                    style={{color: deletable ? '#FE523C' : '#8D91A3'}}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-delete"
                >
                    <ToolbarDeleteIcon/>
                </IconButton>
            </StatementEditorHint>
            {/* <StatementEditorHint content={"Add configurable"} disabled={!configurable || hasSyntaxDiagnostics} >
                <IconButton
                    onClick={onClickOnConfigurable}
                    disabled={!configurable || hasSyntaxDiagnostics}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-configurable"
                >
                    <ToolbarConfigurableIcon/>
                </IconButton>
            </StatementEditorHint> */}
            <Divider orientation="vertical" variant="middle" flexItem={true} className={statementEditorClasses.toolbarDivider}/>
            {(completeModel?.kind && isQualifierSupportedStatements(completeModel)) && (
                <>
                    <StatementQualifiers />
                    <Divider orientation="vertical" variant="middle" flexItem={true} className={statementEditorClasses.toolbarDivider}/>
                </>
            )}
            <ToolbarOperators />
            <Divider orientation="vertical" variant="middle" flexItem={true} className={statementEditorClasses.toolbarDivider} />
            <StatementEditorHint content={"More expressions"} >
                <IconButton
                    onClick={onClickExpressions}
                    className={statementEditorClasses.toolbarIcons}
                    data-testid="toolbar-expressions"
                >
                    <Typography className={statementEditorClasses.toolbarMoreExpIcon}>
                        More
                    </Typography>
                </IconButton>
            </StatementEditorHint>
        </div>
    );
}

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
import React, { useContext, useMemo } from "react";

import IconButton from "@material-ui/core/IconButton";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import ToolbarConfigurableIcon from "../../assets/icons/ToolbarConfigurableIcon";
import ToolbarDeleteIcon from "../../assets/icons/ToolbarDeleteIcon";
import ToolbarRedoIcon from "../../assets/icons/ToolbarRedoIcon";
import ToolbarUndoIcon from "../../assets/icons/ToolbarUndoIcon";
import { ADD_CONFIGURABLE_LABEL, CONFIGURABLE_TYPE_BOOLEAN, CONFIGURABLE_TYPE_STRING } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { StatementEditorWrapperContext } from "../../store/statement-editor-wrapper-context";
import { getModuleElementDeclPosition, getRemainingContent, isNodeDeletable } from "../../utils";
import { ModelType, StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { useStatementEditorStyles } from "../styles";

export default function Toolbar(){
    const statementEditorClasses = useStatementEditorStyles();
    const { editorCtx, syntaxTree } = useContext(StatementEditorWrapperContext);
    const { modelCtx } = useContext(StatementEditorContext);
    const {
        undo,
        redo,
        hasRedo,
        hasUndo,
        statementModel: completeModel,
        updateModel,
        currentModel
    } = modelCtx;
    const {
        editors,
        updateEditor,
        addConfigurable,
        activeEditorId
    } = editorCtx;

    const configurableInsertPosition = getModuleElementDeclPosition(syntaxTree);

    const [deletable, configurable] = useMemo(() => {
        let modelDeletable = false;
        let modelConfigurable = false;

        if (currentModel.model) {
            modelDeletable = isNodeDeletable(currentModel.model);
            modelConfigurable = (currentModel.model.viewState as StatementEditorViewState).modelType === ModelType.EXPRESSION;
        }

        return [modelDeletable, modelConfigurable]
    }, [currentModel.model]);

    const onClickOnDelete = () => {
        const {
            code: newCode,
            position: newPosition
        } = getRemainingContent(currentModel.model.position, completeModel);
        updateModel(newCode, newPosition);
    }

    const onClickOnConfigurable = () => {
        let configurableType = CONFIGURABLE_TYPE_STRING;
        if (STKindChecker.isModuleVarDecl(completeModel) || STKindChecker.isLocalVarDecl(completeModel)) {
            const typeDescNode = completeModel.typedBindingPattern.typeDescriptor;
            if (!STKindChecker.isAnyTypeDesc(typeDescNode)
                && !STKindChecker.isErrorTypeDesc(typeDescNode)
                && !STKindChecker.isFunctionTypeDesc(typeDescNode)
                && !STKindChecker.isJsonTypeDesc(typeDescNode)
                && !STKindChecker.isObjectTypeDesc(typeDescNode)
                && !STKindChecker.isOptionalTypeDesc(typeDescNode)
                && !STKindChecker.isParameterizedTypeDesc(typeDescNode)
                && !STKindChecker.isServiceTypeDesc(typeDescNode)
                && !STKindChecker.isStreamTypeDesc(typeDescNode)
                && !STKindChecker.isTableTypeDesc(typeDescNode)
                && !STKindChecker.isVarTypeDesc(typeDescNode)){

                configurableType = completeModel.typedBindingPattern.typeDescriptor.source;
            }
        } else if (STKindChecker.isWhileStatement(completeModel)
            || STKindChecker.isIfElseStatement(completeModel)) {

            configurableType = CONFIGURABLE_TYPE_BOOLEAN;
        }
        const configurableStmt = `configurable ${configurableType} CONF_NAME = ?;`;
        updateEditor(activeEditorId, {
            ...editors[activeEditorId],
            model: completeModel,
            source: completeModel.source,
            selectedNodePosition: currentModel.model.position
        });
        addConfigurable(ADD_CONFIGURABLE_LABEL, configurableInsertPosition, configurableStmt);
    }

    return(
        <span className={statementEditorClasses.toolbar}>
            <IconButton
                onClick={undo}
                disabled={!hasUndo}
                className={statementEditorClasses.toolbarIcons}
                style={{marginLeft: '14px', marginRight: '7px'}}
            >
                 <ToolbarUndoIcon/>
            </IconButton>
            <IconButton
                onClick={redo}
                disabled={!hasRedo}
                className={statementEditorClasses.toolbarIcons}
                style={{marginRight: '7px'}}
            >
                <ToolbarRedoIcon />
            </IconButton>
            <IconButton
                onClick={onClickOnDelete}
                disabled={!deletable}
                style={{color: deletable ? '#FE523C' : '#8D91A3', marginRight: '14px'}}
                className={statementEditorClasses.toolbarIcons}
            >
                <ToolbarDeleteIcon/>
            </IconButton>
            <IconButton
                onClick={onClickOnConfigurable}
                disabled={!configurable}
                className={statementEditorClasses.toolbarIcons}
                style={{marginRight: '7px'}}
            >
                <ToolbarConfigurableIcon/>
            </IconButton>
        </span>
    );
}

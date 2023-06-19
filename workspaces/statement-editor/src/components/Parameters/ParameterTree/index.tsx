/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { ListItemText, ListSubheader } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { ACTION, CONNECTOR, HTTP_ACTION } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getParamUpdateModelPosition, getParentFunctionModel } from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { parameterHeader, useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";

import { MemoizedParameterBranch } from "./ParameterBranch";
import { getDefaultParams, mapActionToFormField, mapEndpointToFormField } from "./utils";

export interface TypeProps {
    param: FormField;
    depth: number;
    onChange: () => void;
}

export interface ParameterTreeProps {
    parameters: FormField[];
}

export function ParameterTree(props: ParameterTreeProps) {
    const { parameters } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const overlayClasses = useStatementEditorStyles();
    const ParamListSubheader = withStyles(parameterHeader)(ListSubheader);
    const {
        modelCtx: {
            currentModel: { model },
            statementModel,
            updateModel,
        },
        config
    } = useContext(StatementEditorContext);
    const [updatingParams, setUpdatingParams] = useState(true);

    useEffect(() => {
        setUpdatingParams(true);
        if (config.type === CONNECTOR) {
            mapEndpointToFormField(statementModel, parameters);
        } else if (config.type === ACTION) {
            mapActionToFormField(statementModel, parameters);
        } else if (config.type === HTTP_ACTION) {
            // Remove path parameter from the parameters list
            const pathIndex = parameters.findIndex((param) => param.name === "path");
            if (pathIndex > -1) {
                parameters.splice(pathIndex, 1);
            }
            mapActionToFormField(statementModel, parameters);
        }
        setUpdatingParams(false);
    }, [statementModel]);

    const handleOnChange = () => {
        const modelParams = getDefaultParams(parameters);
        let content = "(" + modelParams.join(",") + ")";

        let updatingPosition: NodePosition;
        if (model.viewState?.parentFunctionPos) {
            const parentFunctionModel = getParentFunctionModel((model.viewState as StatementEditorViewState).parentFunctionPos, statementModel);
            if (STKindChecker.isClientResourceAccessAction(parentFunctionModel) && !parentFunctionModel.methodName && modelParams.length > 0) {
                content = ".get" + content; // Update the default GET action with method name
            }
            updatingPosition = getParamUpdateModelPosition(parentFunctionModel);
        } else {
            updatingPosition = getParamUpdateModelPosition(model);
        }

        updateModel(content, updatingPosition);
    };

    return (
        <div data-testid="parameter-tree">
            {parameters?.length > 0 && (
                <>
                    <ParamListSubheader>
                        Configure Parameters
                        <ListItemText secondary={"Select parameters from the list given below"} />
                    </ParamListSubheader>
                    {updatingParams && (
                        <div className={stmtEditorHelperClasses.paramList} data-testid="parameter-loader">
                            <div className={overlayClasses.sectionLoadingWrapper}>Loading Parameters...</div>
                        </div>
                    )}
                    {!updatingParams && (
                        <div className={stmtEditorHelperClasses.paramList}>
                            <MemoizedParameterBranch parameters={parameters} depth={1} onChange={handleOnChange} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

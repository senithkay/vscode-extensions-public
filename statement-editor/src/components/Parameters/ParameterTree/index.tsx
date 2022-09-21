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
import React, { useContext, useEffect, useState } from "react";

import { ListItemText, ListSubheader } from "@material-ui/core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { ACTION, CONNECTOR } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getParamUpdateModelPosition, getParentFunctionModel } from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";

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
        if (config.type === CONNECTOR){
            mapEndpointToFormField(statementModel, parameters);
        }else if (config.type === ACTION){
            mapActionToFormField(statementModel, parameters);
        }
        setUpdatingParams(false);
    }, [statementModel]);

    const handleOnChange = () => {
        const modelParams = getDefaultParams(parameters);
        const content = "(" + modelParams.join(",") + ")";

        let updatingPosition: NodePosition;
        if (model.viewState?.parentFunctionPos) {
            const parentFunctionModel = getParentFunctionModel(
                (model.viewState as StatementEditorViewState).parentFunctionPos,
                statementModel
            );
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
                    <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                        Configure Parameters
                        <ListItemText secondary={"Select parameters from the list given below"} />
                    </ListSubheader>
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

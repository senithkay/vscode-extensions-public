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
import React, { useContext, useEffect, useRef } from "react";

import { ListItemText, ListSubheader } from "@material-ui/core";
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getParamUpdateModelPosition, getParentFunctionModel } from "../../../utils";
import { useStmtEditorHelperPanelStyles } from "../../styles";

import { ParameterBranch } from "./ParameterBranch";
import { getDefaultParams, mapEndpointToFormField } from "./utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";

export interface TypeProps {
    param: FormField;
    depth: number;
    onChange: () => void;
}

export interface ParameterTreeProps {
    parameters: FormField[];
    paramsInModel?: STNode[];
}

export function ParameterTree(props: ParameterTreeProps) {
    const { parameters, paramsInModel } = props;
    const stmtEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const {
        modelCtx: {
            currentModel: { model },
            statementModel,
            updateModel,
        },
    } = useContext(StatementEditorContext);

    useEffect(() => {
        mapEndpointToFormField(model, parameters);
    }, [model]);

    const handleOnChange = () => {
        const modelParams = getDefaultParams(parameters);
        const content = "(" + modelParams.join(",") + ")";
        
        let updatingPosition: NodePosition;
        if (model.viewState?.parentFunctionPos) {
            const parentFunctionModel = getParentFunctionModel(
                (model.parent.viewState as StatementEditorViewState)?.parentFunctionPos,
                statementModel
            );
            updatingPosition = getParamUpdateModelPosition(parentFunctionModel);
        } else {
            updatingPosition = getParamUpdateModelPosition(model);
        }

        updateModel(content, updatingPosition);
    };

    return (
        <>
            {!!parameters?.length && (
                <>
                    <ListSubheader className={stmtEditorHelperClasses.parameterHeader}>
                        Configure Parameters
                        <ListItemText secondary={"Select parameters from the list given below"} />
                    </ListSubheader>
                    <div className={stmtEditorHelperClasses.paramList}>
                        <ParameterBranch parameters={parameters} depth={1} onChange={handleOnChange} />
                    </div>
                </>
            )}
        </>
    );
}

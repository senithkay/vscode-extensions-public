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
import React, { useContext } from "react"

import {
    DeleteButton,
    EditButton,
    FunctionIcon
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionDefinition,
    STKindChecker
} from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { Context } from "../../../Context/diagram";

import "./style.scss";

export interface ExprBodiedFuncComponentProps {
    model: FunctionDefinition;
}

export function ExprBodiedFuncComponent(props: ExprBodiedFuncComponentProps) {
    const { model } = props;

    const diagramContext = useContext(Context);
    const { isReadOnly } = diagramContext.props;
    const deleteComponent = diagramContext?.api?.edit?.deleteComponent;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;

    const handleDeleteConfirm = () => {
        deleteComponent(model);
    };
    const handleEditClick = () => {
        renderEditForm(model, model.position, {
            formType: 'DataMapper', isLoading: false
        }
        )
    };

    const component: JSX.Element[] = [];

    if (STKindChecker.isExpressionFunctionBody(model.functionBody)) {
        const funcName = model.functionName.value;

        component.push(
            <div className="expr-bodied-func-comp" data-record-name={funcName}>
                <div className="function-header" >
                    <div className="function-content">
                        <div className="function-icon">
                            <FunctionIcon />
                        </div>
                        <div className="function-name">
                            {funcName}
                        </div>
                    </div>
                    {!isReadOnly && (
                        <div className="amendment-options">
                            <div className={classNames("edit-btn-wrapper", "show-on-hover")}>
                                <EditButton onClick={handleEditClick} />
                            </div>
                            <div className={classNames("delete-btn-wrapper", "show-on-hover")}>
                                <DeleteButton onClick={handleDeleteConfirm} />
                            </div>
                        </div>
                    )
                    }
                </div>
                <div className="function-separator" />
            </div>
        )
    }

    return (
        <>
            <div id={"edit-div"} />
            {component}
        </>
    );
}

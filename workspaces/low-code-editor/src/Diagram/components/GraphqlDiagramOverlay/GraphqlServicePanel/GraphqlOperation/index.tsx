/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import React, { useContext, useState } from "react";

import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, ObjectMethodDefinition, ResourceAccessorDefinition, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { Context } from "../../../../../Contexts/Diagram";
import { removeStatement } from "../../../../utils";

import { OperationHeader } from "./OperationHeader";

interface GraphqlOperationProps {
    model: ResourceAccessorDefinition | ObjectMethodDefinition;
    functionPanel?: (position: NodePosition, functionType: string, model?: STNode) => void;
}

export function GraphqlOperation(props: GraphqlOperationProps) {
    const { model, functionPanel } = props;

    const {
        api: {
            code: { modifyDiagram },
        },
    } = useContext(Context);

    const [isExpanded, setIsExpanded] = useState(false);

    const handleIsExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const onEdit = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const lastMemberPosition: NodePosition = {
            endColumn: model.position.endColumn,
            endLine: model.position.endLine,
            startColumn: model.position.startColumn,
            startLine: model.position.startLine
        };
        functionPanel(lastMemberPosition, "ResourceForm", model);
        // handleDiagramEdit(model, lastMemberPosition, { formType: "ResourceAccessorDefinition", isLoading: false, renderRecordPanel });
    };

    const handleDeleteBtnClick = (e?: React.MouseEvent) => {
        e.stopPropagation();
        const modifications: STModification[] = [];
        const deleteAction: STModification = removeStatement(
            model.position
        );
        modifications.push(deleteAction);
        modifyDiagram(modifications);
    };

    return (
        <div id={"resource"} className={classNames("function-box", model.functionName.value)}>
            <OperationHeader
                isExpanded={isExpanded}
                onExpandClick={handleIsExpand}
                model={model}
                onEdit={onEdit}
                onDelete={handleDeleteBtnClick}
            />
        </div>
    );
}

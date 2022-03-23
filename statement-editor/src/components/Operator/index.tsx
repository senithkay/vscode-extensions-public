/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext } from "react";

import { AsteriskToken,
    BitwiseAndToken,
    BitwiseXorToken,
    DoubleDotLtToken,
    DoubleEqualToken,
    DoubleGtToken,
    DoubleLtToken,
    EllipsisToken,
    ElvisToken,
    GtEqualToken,
    GtToken,
    LogicalAndToken,
    LogicalOrToken,
    LtEqualToken,
    LtToken,
    NotDoubleEqualToken,
    NotEqualToken,
    PercentToken,
    PipeToken,
    PlusToken,
    SlashToken,
    TrippleEqualToken,
    TrippleGtToken } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { isPositionsEquals } from "../../utils";
import { InputEditor } from "../InputEditor";
import { useStatementEditorStyles } from "../styles";

export interface OperatorProps {
    model:  AsteriskToken |
            BitwiseAndToken |
            BitwiseXorToken |
            DoubleDotLtToken |
            DoubleEqualToken |
            DoubleGtToken |
            DoubleLtToken |
            EllipsisToken |
            ElvisToken |
            GtEqualToken |
            GtToken |
            LogicalAndToken |
            LogicalOrToken |
            LtEqualToken |
            LtToken |
            NotDoubleEqualToken |
            NotEqualToken |
            PercentToken |
            PipeToken |
            PlusToken |
            SlashToken |
            TrippleEqualToken |
            TrippleGtToken;
}

export function OperatorComponent(props: OperatorProps) {
    const { model } = props;

    const [isHovered, setHovered] = React.useState(false);

    const { modelCtx } = useContext(StatementEditorContext);
    const {
        currentModel: selectedModel,
        changeCurrentModel
    } = modelCtx;

    const statementEditorClasses = useStatementEditorStyles();

    const isSelected = selectedModel.model && model && isPositionsEquals(selectedModel.model.position, model.position);

    const onMouseOver = (e: React.MouseEvent) => {
        setHovered(true);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseOut = (e: React.MouseEvent) => {
        setHovered(false);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        changeCurrentModel(model);
    }

    const styleClassNames = cn(statementEditorClasses.expressionElement,
        isSelected && statementEditorClasses.expressionElementSelected,
        {
            "hovered": !isSelected && isHovered,
        },
    )
    const inputEditorProps = {
        model,
        isToken: true,
        classNames: "operator"
    };

    return (
        <span
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            className={styleClassNames}
            onClick={onMouseClick}
        >
            <InputEditor {...inputEditorProps} />
        </span>
    );
}

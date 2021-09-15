import React from "react";

import * as c from "../../../constants";
import { Expression, Variable } from "../../../models/definitions";
import {statementEditorStyles} from "../../ViewContainer/styles";

interface VariableProps {
    model: Expression
}

export function VariableC(props: VariableProps) {
    const overlayClasses = statementEditorStyles();
    const { model } = props;
    let name: any;

    if (model.kind === c.VARIABLE) {
        const variableModel: Variable = model.expressionType as Variable;
        name = variableModel.name;
    }

    return (
        <span
            className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockElement}`}
        >
            {name}
        </span>
    );
}

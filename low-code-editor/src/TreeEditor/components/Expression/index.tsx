import React from "react";

import {Expression} from "../../models/definitions";
import {getExpressionTypeComponent, getSuggestionsBasedOnExpressionKind} from "../../utils";
import { IfStatement } from "../Statements/IfStatement";
import { VariableStatement } from "../Statements/VariableStatement";

interface ExpressionComponentProps {
    model: Expression
    callBack: (suggestions: string[], model: Expression, operator: boolean) => void
    isRoot: boolean
}
export function ExpressionComponent(props: ExpressionComponentProps) {
    const {model, callBack, isRoot} = props;

    const component = getExpressionTypeComponent(model, callBack);

    return (
        // <IfStatement
        //     model={model}
        //     callBack={callBack}
        //     isRoot={isRoot}
        //     component={component}
        // />
        <VariableStatement
            model={model}
            callBack={callBack}
            isRoot={isRoot}
            component={component}
        />
    );
}

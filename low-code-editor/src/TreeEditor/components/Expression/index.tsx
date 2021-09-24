import React from "react";

import {STNode} from "@ballerina/syntax-tree";

import {getExpressionTypeComponent} from "../../utils";
import {SuggestionItem} from "../../utils/utils";
import {VariableStatement} from "../Statements/VariableStatement";

interface ExpressionComponentProps {
    model: STNode
    callBack: (suggestions: SuggestionItem[], model: STNode, operator: boolean) => void
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

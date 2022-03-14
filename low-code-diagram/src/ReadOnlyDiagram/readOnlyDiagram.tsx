import React from "react";

import { FunctionDefinition, ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";

import { Provider } from "../Context/diagram";
import { LowCodeDiagramProperties } from "../Context/types";

import { FunctionDiagram } from "./functionDiagram";

export function ReadOnlyDiagram(props: { model: FunctionDefinition | ResourceAccessorDefinition }) {
    const { model } = props;

    const context: LowCodeDiagramProperties = {
        syntaxTree: model,
        isReadOnly: true,
    }

    return (
        <Provider {...context}>
            <FunctionDiagram model={model} />
        </Provider>
    );
}

import React from "react";
import MonacoEditor from "react-monaco-editor";

import { ExpressionInjectablesProps } from "./config-spec";

export interface ExpressionConfigurableProps {
    varType: string;
    textLabel: string;
    expressionInjectables?: ExpressionInjectablesProps;
    model: any;
    monacoRef: React.MutableRefObject<MonacoEditor>;
    showConfigurableView: boolean;
    setShowConfigurableView: (visible: boolean) => void;
}

export const configurableTypes = ["string", "int", "float", "boolean", "xml"];

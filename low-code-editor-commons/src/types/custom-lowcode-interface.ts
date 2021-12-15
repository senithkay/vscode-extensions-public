import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { DiagramEditorLangClientInterface } from "./diagram-editor-lang-client-interface";
import { ExpressionEditorLangClientInterface } from "./expression-editor-lang-client-interface";

export interface CustomLowCodeContext {
    targetPosition: NodePosition;
    currentFile: {
        content: string,
        path: string,
        size: number
    };
    langServerURL: string;
    syntaxTree: STNode;
    diagnostics?: Diagnostic[];
    ls: {
        getDiagramEditorLangClient?: () => Promise<DiagramEditorLangClientInterface>;
        getExpressionEditorLangClient?: () => Promise<ExpressionEditorLangClientInterface>;
    }
}

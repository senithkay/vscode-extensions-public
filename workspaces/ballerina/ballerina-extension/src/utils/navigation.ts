import { BallerinaSTModifyResponse, VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { getLangClient, openView } from "../visualizer/activator";
import { Uri } from "vscode";
import { TextDocumentPositionParams } from "vscode-languageclient";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

export async function handleVisualizerView(params: VisualizerLocationContext) {
    const position: TextDocumentPositionParams = {
        textDocument: { uri: Uri.file(params.location.fileName).toString() },
        position: { line: params.location.position.startLine, character: params.location.position.startColumn }
    };
    const node = await getLangClient().getDefinitionPosition(position) as BallerinaSTModifyResponse;
    if (node.parseSuccess) {
        if (STKindChecker.isServiceDeclaration(node.syntaxTree)) {
            openView({ view: "ServiceDesigner" });
        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) && STKindChecker.isExpressionFunctionBody(node.syntaxTree.functionBody)) {
            openView({ view: "DataMapper" });
        } else if (STKindChecker.isTypeDefinition(node.syntaxTree) && STKindChecker.isRecordTypeDesc(node.syntaxTree.typeDescriptor)) {
            openView({ view: "Architecture" });
        } else {
            openView({ view: "Overview" });
        }
    }
}

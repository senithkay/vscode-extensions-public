import { BallerinaSTModifyResponse, VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { getLangClient, openView } from "../visualizer/activator";
import { Uri } from "vscode";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { BallerinaFunctionSTRequest } from "@wso2-enterprise/ballerina-languageclient";

export async function handleVisualizerView(params: VisualizerLocationContext) {
    const req: BallerinaFunctionSTRequest = {
        documentIdentifier: { uri: Uri.file(params.location.fileName).toString() },
        lineRange: {
            start : {
                line: params.location.position.startLine,
                character: params.location.position.startColumn
            },
            end : {
                line: params.location.position.endLine,
                character: params.location.position.endColumn
            }
        }
    };

    const node = await getLangClient().getSTByRange(req) as BallerinaSTModifyResponse;
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

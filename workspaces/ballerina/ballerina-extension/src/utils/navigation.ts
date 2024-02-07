import { BallerinaSTModifyResponse, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { StateMachine, openView } from "../stateMachine";
import { Uri } from "vscode";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { BallerinaFunctionSTRequest } from "@wso2-enterprise/ballerina-languageclient";


export async function getSyntaxTreeFromPosition(position: BallerinaFunctionSTRequest) {
    return await StateMachine.langClient().getSTByRange(position) as BallerinaSTModifyResponse;
}

export async function handleVisualizerView(visualizer: VisualizerLocation) {
    const req: BallerinaFunctionSTRequest = {
        documentIdentifier: { uri: Uri.file(visualizer.documentUri).toString() },
        lineRange: {
            start: {
                line: visualizer.position.startLine,
                character: visualizer.position.startColumn
            },
            end: {
                line: visualizer.position.endLine,
                character: visualizer.position.endColumn
            }
        }
    };

    const node = await getSyntaxTreeFromPosition(req);
    if (node.parseSuccess) {
        if (STKindChecker.isServiceDeclaration(node.syntaxTree)) {
            openView("OPEN_VIEW", { view: "ServiceDesigner", documentUri: visualizer.documentUri });
        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) && STKindChecker.isExpressionFunctionBody(node.syntaxTree.functionBody)) {
            openView("OPEN_VIEW", { view: "DataMapper", documentUri: visualizer.documentUri });
        } else if (STKindChecker.isTypeDefinition(node.syntaxTree) && STKindChecker.isRecordTypeDesc(node.syntaxTree.typeDescriptor)) {
            openView("OPEN_VIEW", { view: "ArchitectureDiagram", documentUri: visualizer.documentUri });
        } else {
            openView("OPEN_VIEW", { view: "Overview", documentUri: visualizer.documentUri });
        }
    }
}

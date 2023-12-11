import { NodeLocation } from "@wso2-enterprise/eggplant-core";
import { openView, stateService } from "../stateMachine";
import { BallerinaFunctionSTRequest, BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";


export async function getSyntaxTreeFromPosition(position: BallerinaFunctionSTRequest) {
    const context = stateService.getSnapshot();
    const langServer = context.context.langServer!;
    return await langServer.getSTByRange(position) as BallerinaSTModifyResponse;
}

export async function handleVisualizerView(location: NodeLocation) {
    const req: BallerinaFunctionSTRequest = {
        documentIdentifier: { uri: Uri.file(location.fileName).toString() },
        lineRange: {
            start: {
                line: location.position.startLine as number,
                character: location.position.startColumn as number
            },
            end: {
                line: location.position.endLine as number,
                character: location.position.endColumn as number
            }
        }
    };

    const node = await getSyntaxTreeFromPosition(req);
    if (node.parseSuccess) {
        if (STKindChecker.isServiceDeclaration(node.syntaxTree)) {
            openView({ view: "ServiceDesigner", location: location });
        } else if (STKindChecker.isFunctionDefinition(node.syntaxTree) && STKindChecker.isExpressionFunctionBody(node.syntaxTree.functionBody)) {
            openView({ view: "DataMapper", location: location });
        } else if (STKindChecker.isTypeDefinition(node.syntaxTree) && STKindChecker.isRecordTypeDesc(node.syntaxTree.typeDescriptor)) {
            openView({ view: "Architecture", location: location });
        } else {
            openView({ view: "Overview", location: location });
        }
    }
}

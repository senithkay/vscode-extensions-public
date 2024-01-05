import { BallerinaSTModifyResponse, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { getLangClient, openView } from "../visualizer/activator";
import { Uri } from "vscode";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { BallerinaFunctionSTRequest } from "@wso2-enterprise/ballerina-languageclient";


export async function getSyntaxTreeFromPosition(position: BallerinaFunctionSTRequest){
   return await getLangClient().getSTByRange(position) as BallerinaSTModifyResponse;
}

export async function handleVisualizerView(location: VisualizerLocation) {
    const req: BallerinaFunctionSTRequest = {
        documentIdentifier: { uri: Uri.file(location.fileName).toString() },
        lineRange: {
            start : {
                line: location.position.startLine,
                character: location.position.startColumn
            },
            end : {
                line: location.position.endLine,
                character: location.position.endColumn
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

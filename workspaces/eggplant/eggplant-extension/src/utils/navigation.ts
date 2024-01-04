import { StateMachine } from "../stateMachine";
import { BallerinaFunctionSTRequest, BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";


export async function getSyntaxTreeFromPosition(position: BallerinaFunctionSTRequest) {
    const context = StateMachine.context();
    const langServer = context.langServer!;
    return await langServer.getSTByRange(position) as BallerinaSTModifyResponse;
}

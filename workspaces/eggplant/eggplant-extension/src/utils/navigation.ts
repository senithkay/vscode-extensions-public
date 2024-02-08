import { StateMachine } from "../stateMachine";
import { STByRangeRequest, BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";


export async function getSyntaxTreeFromPosition(position: STByRangeRequest) {
    return await StateMachine.langClient().getSTByRange(position) as BallerinaSTModifyResponse;
}

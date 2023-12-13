import { BallerinaFunctionSTRequest, BallerinaSTModifyResponse } from "@wso2-enterprise/ballerina-core";
import { LangClientInterface } from "@wso2-enterprise/eggplant-core";

enum EXTENDED_APIS {
    DOCUMENT_ST_BY_RANGE = 'ballerinaDocument/syntaxTreeByRange',
}

export function registerNewLSMethods(langClient: LangClientInterface): LangClientInterface {
    // YOU CAN ADD EGGPLANT SPECIFIC LANG CLIENT METHODS HERE
    langClient.getSTByRange = async (params: BallerinaFunctionSTRequest) => {
        return langClient.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_BY_RANGE, params);
    };

    return langClient;
}

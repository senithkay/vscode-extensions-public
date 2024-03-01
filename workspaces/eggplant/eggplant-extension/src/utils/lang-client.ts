import { BallerinaSTModifyResponse, EggplantModelRequest, LangClientInterface, STByRangeRequest } from "@wso2-enterprise/eggplant-core";

enum EXTENDED_APIS {
    DOCUMENT_ST_BY_RANGE = 'ballerinaDocument/syntaxTreeByRange',
    EGGPLANT_MODEL = 'flowDesignService/getFlowDesignModel'
}

// YOU CAN ADD EGGPLANT SPECIFIC LANG CLIENT METHODS HERE
export function registerNewLSMethods(langClient: LangClientInterface): LangClientInterface {
    langClient.getSTByRange = async (params: STByRangeRequest) => {
        return langClient.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_BY_RANGE, params);
    };

    langClient.getEggplantModel = async (params: EggplantModelRequest) => {
        return langClient.sendRequest<any>(EXTENDED_APIS.EGGPLANT_MODEL, params);
    };

    return langClient;
}

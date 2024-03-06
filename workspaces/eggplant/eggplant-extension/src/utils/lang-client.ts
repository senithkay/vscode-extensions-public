import { BallerinaSTModifyResponse, EggplantModelRequest, LangClientInterface, STByRangeRequest, UpdateNodeRequest, UpdateNodeResponse } from "@wso2-enterprise/eggplant-core";

enum EXTENDED_APIS {
    DOCUMENT_ST_BY_RANGE = 'ballerinaDocument/syntaxTreeByRange',
    EGGPLANT_MODEL = 'flowDesignService/getFlowDesignModel',
    UPDATE_NODE = 'flowDesignService/getSourceCode'
}

// YOU CAN ADD EGGPLANT SPECIFIC LANG CLIENT METHODS HERE
export function registerNewLSMethods(langClient: LangClientInterface): LangClientInterface {
    langClient.getSTByRange = async (params: STByRangeRequest) => {
        return langClient.sendRequest<BallerinaSTModifyResponse>(EXTENDED_APIS.DOCUMENT_ST_BY_RANGE, params);
    };

    langClient.getEggplantModel = async (params: EggplantModelRequest) => {
        return langClient.sendRequest<any>(EXTENDED_APIS.EGGPLANT_MODEL, params);
    };

    langClient.getUpdatedNodeModifications = async (params: UpdateNodeRequest) => {
        return langClient.sendRequest<UpdateNodeResponse>(EXTENDED_APIS.UPDATE_NODE, params);
    };

    return langClient;
}

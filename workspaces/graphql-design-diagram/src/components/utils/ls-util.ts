import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    DiagramEditorLangClientInterface,
    GraphqlDesignServiceRequest, GraphqlDesignServiceResponse
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export async function getModelForGraphqlService(
    graphqlDesignRequest: GraphqlDesignServiceRequest,
    langClientPromise: Promise<IBallerinaLangClient>): Promise<GraphqlDesignServiceResponse> {
    const langClient: DiagramEditorLangClientInterface = await langClientPromise;
    const resp = await langClient.getGraphqlModel(graphqlDesignRequest);
    return resp;
}

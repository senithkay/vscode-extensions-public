import {
    DiagramEditorLangClientInterface,
    GraphqlDesignServiceRequest
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export async function getModelForGraphqlService(
    graphqlDesignRequest: GraphqlDesignServiceRequest,
    getLangClient: () => Promise<DiagramEditorLangClientInterface>): Promise<any> {
    const langClient: DiagramEditorLangClientInterface = await getLangClient();
    const resp = await langClient.getGraphqlModel(graphqlDesignRequest);
    return resp.graphqlDesignModel;
}

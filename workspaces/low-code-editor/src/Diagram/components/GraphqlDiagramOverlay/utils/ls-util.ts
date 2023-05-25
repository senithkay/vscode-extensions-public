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

export function isGraphqlVisualizerSupported(version: string): boolean {
    // Version example
    // 2301.0.0
    // major release of next year
    // YYMM.0.0
    if (!version) {
        return false;
    }
    const versionRegex = new RegExp("^[0-9]{4}.[0-9].[0-9]");
    const versionStr = version.match(versionRegex);
    const splittedVersions = versionStr[0]?.split(".");
    if ((parseInt(splittedVersions[0], 10) === 2201)) {
        // 2201.1.x
        return parseInt(splittedVersions[1], 10) >= 5;
    } else  if (parseInt(splittedVersions[0], 10) > 2201) {
        // > 2201 (eg: 2301, 2202)
        return true;
    } else {
        return false;
    }
}

import { ExtendedDiagnostic } from "@wso2-enterprise/ballerina-core";
import { getLangClient } from "../../visualizer/activator";
import { URI } from "vscode-uri";

export const FILE_SCHEME = "file://";
export const EXPR_SCHEME = "expr://";
export const DM_DEFAULT_FUNCTION_NAME = "transform";

export const getVirtualDiagnostics = async (
    filePath: string,
    currentFileContent: string,
    newContent: string
): Promise<ExtendedDiagnostic[]> => {
    const langServerRpcClient = getLangClient();
    const docUri = URI.file(filePath).toString().replace(FILE_SCHEME, EXPR_SCHEME);
    langServerRpcClient.didOpen({
        textDocument: {
            uri: docUri,
            languageId: "ballerina",
            text: currentFileContent,
            version: 1,
        },
    });
    langServerRpcClient.didChange({
        contentChanges: [
            {
                text: newContent,
            },
        ],
        textDocument: {
            uri: docUri,
            version: 1,
        },
    });
    const diagResp = await langServerRpcClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        },
    });
    langServerRpcClient.didClose({
        textDocument: {
            uri: docUri,
        },
    });

    return diagResp[0]?.diagnostics || [];
};


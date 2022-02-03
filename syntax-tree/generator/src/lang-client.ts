import { createStdioLangClient, StdioBallerinaLangServer } from "@wso2-enterprise/lang-service";
import { ChildProcess } from "child_process";
import { readFileSync } from 'fs';
import URI from "vscode-uri";

let server: any;
let client: any;

const clientPromise = init();

export async function init() {
    server = new StdioBallerinaLangServer(process.env.BALLERINA_SDK_PATH);
    server.start();

    client = await createStdioLangClient(server.lsProcess as ChildProcess, () => {/**/}, () => {/**/});
    if (!client) {
        // tslint:disable-next-line:no-console
        console.error("Could not initiate language client");
    }

    await client.init();
}

export function shutdown() {
    client.close();
    server.shutdown();
}

export async function genSyntaxTree(balFilePath: string) {
    let syntaxTree;
    try {
        const data = readFileSync(balFilePath, 'utf8')
        await clientPromise;
        await client.didOpen({
            textDocument: {
                uri: URI.file(balFilePath).toString(),
                languageId: "ballerina",
                text: data,
                version: 1
            }
        });

        const astResp = await client.getSyntaxTree({
            documentIdentifier: { uri: URI.file(balFilePath).toString() }
        });
        syntaxTree = astResp.syntaxTree;
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.log(`Error when parsing ${balFilePath} \n ${e}`);
    }
    return syntaxTree;
}

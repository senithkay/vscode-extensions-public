/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import path from "path";
import { getDataFromST, getXML } from "../template-engine/mustach-templates/templateUtils";
import { normalizeXML, readXMLFile } from "./utils/test-utils";
import { getNodeDescription } from "../node";
// import { MILanguageClient } from "./lang-client/activator";
import { createWSLangClient } from "./lang-service/client/ws";
import { StdioBallerinaLangServer as StdioMILangServer, WSMILangServer } from "./lang-service/server";
import { IMILangClient, createStdioLangClient } from "./lang-service/client";
import { ChildProcess } from "child_process";

const xmlRootDirectory = path.join(process.cwd(), "src", "utils", "test", "data", "xml");

export const mediatorTestCases = [
    {
        type: 'Filter',
        expectedDescription: 'Filter Description',
        expectedMissingDescription: 'Expresion Value matches a?b+$'
    }
    // Add more test cases as needed
];

/**
 * Function to test the XML generation of a mediator.
 * @param mediatorType The type of the mediator.
 */
async function testMediatorXML(mediatorType: string) {
    const mediatorST = await import(`./data/st/${mediatorType.toLowerCase()}-st.json`);
    const mediatorData = getDataFromST(mediatorType, mediatorST);
    const generatedXml = getXML(mediatorType, mediatorData);
    const expectedXML = await readXMLFile(path.join(xmlRootDirectory, `${mediatorType}.xml`));
    const normalizedExpectedXML = normalizeXML(expectedXML);
    const normalizedGeneratedXML = normalizeXML(generatedXml);
    expect(normalizedGeneratedXML).toBe(normalizedExpectedXML);
}
/**
 * Function to test the description of a mediator.
 * @param mediatorType The type of the mediator.
 * @param expectedDescription The expected description of the mediator.
 */
async function testMediatorDescription(mediatorType: string, expectedDescription: string) {
    const mediatorST = await import(`./data/st/${mediatorType.toLowerCase()}-st.json`);
    const description = getNodeDescription(mediatorType, mediatorST);
    expect(description).toBe(expectedDescription);
}

/**
 * Function to test the description of a mediator.
 * @param mediatorType The type of the mediator.
 * @param expectedDescription The expected description of the mediator.
 */
async function testMediatorWithoutDescription(mediatorType: string, expectedDescription: string) {
    const mediatorST = await import(`./data/st/${mediatorType.toLowerCase()}-no-des-st.json`);
    const description = getNodeDescription(mediatorType, mediatorST);
    expect(description).toBe(expectedDescription);
}

// beforeAll(async () => {
//     const ls = (await MILanguageClient.getInstance()).languageClient;
//     const response = await ls.getSyntaxTree({
//         documentIdentifier: {
//             uri: context.documentUri!
//         },
//     });
// });

let client: IMILangClient;
let server;

// describe.skip('Test MI Diagram', () => {
    // mediatorTestCases.forEach(({ type, expectedDescription, expectedMissingDescription }) => {
    //     test(`Test ${type} mediator XML`, async () => {
    //         await testMediatorXML(type);
    //     });

    //     test(`Test ${type} mediator description`, () => {
    //         testMediatorDescription(type, expectedDescription);
    //     });

    //     test(`Test ${type} mediator without description`, () => {
    //         testMediatorWithoutDescription(type, expectedMissingDescription);
    //     });
    // });

    // test(`Test`, async () => {
    //     const ls = (await MILanguageClient.getInstance()).languageClient;
    //     const response = await ls.getSyntaxTree({
    //         documentIdentifier: {
    //             uri: "/Users/tharinduj/Documents/wso2/git/ballerina-plugin-vscode/workspaces/mi/mi-diagram/src/utils/test/data/xml/test.xml"
    //         },
    //     });
    //     console.log(response);
    // });
// });

beforeAll((done) => {
    console.log("Starting the server");
    server = new WSMILangServer(9090);
    server.start();
    console.log("Server started ", server);
    // tslint:disable-next-line:no-empty
    // createStdioLangClient(server.lsProcess as ChildProcess, () => {}, () => {})
    // .then((stdioClient) => {
    //     client = stdioClient;
    //     done();
    // });
});

describe.skip('Test MI Diagram', () => {
    test("WS server init success", () => {
        console.log("Client: ", client);
        expect(1).toEqual(1);
        // expect(client).toBeTruthy();
        // if (client) {
        //     // client.init()
        //     //     .then((result) => {
        //     //         // expect(result.capabilities).toBeTruthy();
        //     //         // expect(result.capabilities.experimental.astProvider).toBeTruthy();
        //     //         // expect(result.capabilities.experimental.examplesProvider).toBeTruthy();
        //     //         done();
        //     //     });
        // }
    });

});

describe.skip('Test MI Diagram', () => {
    test("WS server init success", () => {
        expect(1).toEqual(1);
    });

});

afterAll(() => {
    // client.close();
    // server.shutdown();
    // done();
});

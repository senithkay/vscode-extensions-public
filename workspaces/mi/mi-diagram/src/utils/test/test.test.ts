/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import path from "path";
import { LanguageClient } from "./lang-service/client";

const extensionRoot = path.join(__dirname, "data", "xml");

describe('Language Server Tests', () => {
    let langClient: LanguageClient;

    beforeAll(async () => {
        const client = new LanguageClient();
        await client.start();
        langClient = client;
    }, 100000); 

    afterAll(async () => {
        await langClient.stop();
    });

    test('Get Syntax Tree', async (done) => {

        try {
            const uri = path.join(extensionRoot, "filter.xml");

            const syntaxTree = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri
                }
            });
            console.log('Syntax Tree:', JSON.stringify(syntaxTree, null, 2));
            expect(syntaxTree).not.toBeNull();
            done();

        } catch (error) {
            console.error('Error:', error);
        }
    }, 20000);
});

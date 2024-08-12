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
import { getMediatorDescription, isValidMediatorXML } from "./utils/test-utils";

const dataRoot = path.join(__dirname, "data");

export interface MediatorTestCase {
    type: string;
    expectedDescription?: string;
    expectedDefaultDescription: string | undefined;
}

export const mediatorTestCases: MediatorTestCase[] = [
    {
        type: "Filter",
        expectedDescription: "Filter Description",
        expectedDefaultDescription: "expr matches regex"
    },
    {
        type: "Switch",
        expectedDescription: "Switch Description",
        expectedDefaultDescription: "Source XPath"
    },
    {
        type: "Clone",
        expectedDescription: "Clone Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Iterate",
        expectedDescription: "Iterate Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "ForEach",
        expectedDescription: "For Each Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Aggregate",
        // TODO: Fix the expected description
        // expectedDescription: 'Aggregate Description',
        expectedDefaultDescription: undefined
    },
    {
        type: "Validate",
        expectedDescription: "Validate Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Enrich",
        expectedDescription: "Enrich Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Header",
        expectedDescription: "Header Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "XSLT",
        expectedDescription: "XSLT Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "JSONTransform",
        expectedDescription: "JSON Transform Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Fault",
        expectedDescription: "Fault Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "PayloadFactory",
        expectedDescription: "Payload Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "DataMapper",
        expectedDescription: "Data Mapper Description",
        expectedDefaultDescription: "DM"
    },
    {
        type: "Script",
        expectedDescription: "Script Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Class",
        expectedDescription: "Class Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Call",
        expectedDescription: "Call Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Property",
        expectedDescription: "Property Description",
        expectedDefaultDescription: "Property Name"
    },
    {
        type: "Log",
        expectedDescription: "Log Description",
        expectedDefaultDescription: "Prop Name"
    },
    {
        type: "Respond",
        expectedDescription: "Respond Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Call Sequence",
        expectedDescription: "Call Sequence Description",
        expectedDefaultDescription: "defseq"
    },
    {
        type: "CallTemplate",
        expectedDescription: "CallTemplate Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Drop",
        expectedDescription: "Drop Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "PropertyGroup",
        expectedDescription: "Property Group Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Cache",
        expectedDescription: "Cache Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Throttle",
        expectedDescription: "Throttle Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Store",
        expectedDescription: "Store Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "OAuth",
        expectedDescription: "OAuth Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "EntitlementService",
        expectedDescription: "Entitlement Service Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "NTLM",
        expectedDescription: "NTLM Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Call Data Service",
        expectedDescription: "Call Dataservice Description",
        expectedDefaultDescription: "sdfa"
    },
    {
        type: "Dblookup",
        expectedDescription: "DB Lookup Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Dbreport",
        expectedDescription: "DB Report Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Callout",
        expectedDescription: "Callout Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Smooks",
        expectedDescription: "Smooks Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Transaction",
        expectedDescription: "Transaction Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Builder",
        expectedDescription: "Builder Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Rule",
        expectedDescription: "Rule Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Loopback",
        expectedDescription: "Loopback Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Publish Event",
        expectedDescription: "Publish Event Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "FastXSLT",
        expectedDescription: "Fast XSLT Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Rewrite",
        expectedDescription: "Rewrite Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "XQuery",
        expectedDescription: "XQuery Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Event",
        expectedDescription: "Event Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Bean",
        expectedDescription: "Bean Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Command",
        expectedDescription: "Command Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Ejb",
        expectedDescription: "EJB Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Spring",
        expectedDescription: "Spring Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "ConditionalRouter",
        expectedDescription: "Conditional Router Description",
        expectedDefaultDescription: undefined
    },
    {
        type: "Bam",
        expectedDescription: "BAM Description",
        expectedDefaultDescription: undefined
    }
    // Add more test cases as needed
];

describe('Test MI Mediators', () => {
    let langClient: LanguageClient;

    beforeAll(async () => {
        const client = new LanguageClient();
        await client.start();
        langClient = client;
    }, 100000);

    afterAll(async () => {
        await langClient.stop();
    });

    mediatorTestCases.forEach(({ type, expectedDescription, expectedDefaultDescription }) => {
        const fileName = type.replace(/ /g, '');
        test(`Test ${type} Mediator`, async (done) => {
            try {
                const uri = path.join(dataRoot, "input-xml", `${fileName}.xml`);
                const syntaxTree = await langClient.getSyntaxTree({
                    documentIdentifier: {
                        uri
                    }
                });
                const res = await isValidMediatorXML(type, syntaxTree);
                expect(res).toBeTruthy();
                done();
            } catch (error) {
                console.error('Error:', error);
            }
        }, 20000);

        test(`Test ${type} Mediator Default Description`, async (done) => {
            try {
                const uri = path.join(dataRoot, "input-xml", `${fileName}.xml`);
                const syntaxTree = await langClient.getSyntaxTree({
                    documentIdentifier: {
                        uri
                    }
                });
                if (!syntaxTree) {
                    throw new Error("Syntax tree is undefined");
                }
                const res = await getMediatorDescription(type, syntaxTree);
                expect(res).toEqual(expectedDefaultDescription);
                done();
            } catch (e) {
                done.fail(e as string);
            }
        }, 20000);

        if (expectedDescription) {
            test(`Test ${type} Mediator Description`, async (done) => {
                try {
                    const uri = path.join(dataRoot, "input-xml", `${fileName}WithDescription.xml`);
                    const syntaxTree = await langClient.getSyntaxTree({
                        documentIdentifier: {
                            uri
                        }
                    });
                    if (!syntaxTree) {
                        throw new Error("Syntax tree is undefined");
                    }
                    const res = await getMediatorDescription(type, syntaxTree);
                    expect(res).toEqual(expectedDescription);
                    done();
                } catch (e) {
                    done.fail(e as string);
                }
            }, 20000);
        }
    });
});

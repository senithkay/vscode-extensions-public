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

describe('Test MI Diagram', () => {
    mediatorTestCases.forEach(({ type, expectedDescription, expectedMissingDescription }) => {
        test(`Test ${type} mediator XML`, async () => {
            await testMediatorXML(type);
        });

        test(`Test ${type} mediator description`, () => {
            testMediatorDescription(type, expectedDescription);
        });

        test(`Test ${type} mediator without description`, () => {
            testMediatorWithoutDescription(type, expectedMissingDescription);
        });
    });
});
import { promises as fs } from 'fs';
import { parseString } from 'xml2js';
import deepEqual from 'deep-equal';
import { getNodeDescription } from '../../node';
import { getDataFromST, getXML } from '../../template-engine/mustach-templates/templateUtils';
import path from 'path';

const xmlRootDirectory = path.join(process.cwd(), "src", "utils", "test", "data", "xml");

/**
 * Reads the content of an XML file.
 * @param filePath The path to the XML file.
 * @returns A promise that resolves to the content of the XML file.
 */
export async function readXMLFile(filePath: string): Promise<string> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        throw new Error(`Failed to read XML file: ${error}`);
    }
}

/**
 * Parses an XML string to a JavaScript object.
 * @param xmlString The XML string to parse.
 * @returns A promise that resolves to the parsed object.
 */
export function parseXML(xmlString: string): Promise<any> {
    return new Promise((resolve, reject) => {
        parseString(xmlString, { explicitArray: false, trim: true }, (err: any, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

export async function areXMLsEqual(xml1: string, xml2: string): Promise<boolean> {
    try {
        const obj1 = await parseXML(xml1);
        const obj2 = await parseXML(xml2);

        console.log('Parsed XML1:', obj1);
        console.log('Parsed XML2:', obj2);

        // Accessing the child element in XML1
        const childValue = obj1.root.child;
        console.log('Child value in XML1:', childValue);

        return deepEqual(obj1, obj2);
    } catch (error) {
        console.error('Error parsing XML:', error);
        return false;
    }
}

/**
 * Normalizes an XML string by removing unnecessary whitespace.
 * @param xml The XML string to normalize.
 * @returns The normalized XML string.
 */
export function normalizeXML(xml: string): string {
    return xml
        .replace(/>\s+</g, '><')  // Remove spaces between tags
        .replace(/\s{2,}/g, ' ')  // Replace multiple spaces with a single space
        .replace(/"\s+/g, '"')    // Remove space after opening quote in attribute
        .replace(/\s+"/g, '"')    // Remove space before closing quote in attribute
        .trim();
}

/**
 * Function to test the XML generation of a mediator.
 * @param mediatorType The type of the mediator.
 */
export async function testMediatorXML(mediatorType: string) {
    const mediatorST = await import(`./../data/st/${mediatorType.toLowerCase()}-st.json`);
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
export async function testMediatorDescription(mediatorType: string, expectedDescription: string) {
    const mediatorST = await import(`./../data/st/${mediatorType.toLowerCase()}-st.json`);
    const mediatorData = getDataFromST(mediatorType, mediatorST);
    const description = getNodeDescription(mediatorType, mediatorData);
    expect(description).toBe(expectedDescription);
}

/**
 * Function to test the description of a mediator.
 * @param mediatorType The type of the mediator.
 * @param expectedDescription The expected description of the mediator.
 */
export async function testMediatorWithoutDescription(mediatorType: string, expectedDescription: string) {
    const mediatorST = await import(`./data/st/${mediatorType.toLowerCase()}-no-des-st.json`);
    const description = getNodeDescription(mediatorType, mediatorST);
    expect(description).toBe(expectedDescription);
}

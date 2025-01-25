'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import path from "path";
import { StateMachine } from "../../stateMachine";
import { TestsDiscoveryRequest, TestsDiscoveryResponse, TestFunction } from "@wso2-enterprise/ballerina-core";
import { BallerinaExtension } from "../../core";
import { Position, Range, TestController, Uri } from "vscode";


export async function discoverTestFunctionsInProject(ballerinaExtInstance: BallerinaExtension, 
    testController: TestController) {
    const filePath : string = path.join(StateMachine.context().projectUri);
    const request: TestsDiscoveryRequest = {
        filePath
    };
    const response: TestsDiscoveryResponse = await ballerinaExtInstance.langClient?.getProjectTestFunctions(request);
    if (response) {
        createTests(response, testController);
    }
}

function createTests(response: TestsDiscoveryResponse, testController: TestController) {
    if (response.result) {
        const projectDir = path.join(StateMachine.context().projectUri);

        // Check if the result is a Map or a plain object
        const isMap = response.result instanceof Map;

        // Convert the result to an iterable format
        const entries = isMap
            ? Array.from(response.result.entries()) // If it's a Map, convert to an array of entries
            : Object.entries(response.result); // If it's a plain object, use Object.entries

        // Iterate over the result map
        for (const [group, testFunctions] of entries) {
            // Create a test item for the group
            const groupId = `${group}`;
            let groupItem = testController.items.get(groupId);

            if (!groupItem) {
                // If the group doesn't exist, create it
                groupItem = testController.createTestItem(groupId, group);
                testController.items.add(groupItem);
            }

            // Ensure testFunctions is iterable (convert to an array if necessary)
            const testFunctionsArray = Array.isArray(testFunctions) 
            ? testFunctions // If it's already an array, use it directly
            : Object.values(testFunctions); // If it's an object, convert to an array

            // Iterate over the test functions in the group
            for (const tf of testFunctionsArray) {
                const testFunc : TestFunction = tf as TestFunction;
                // Generate a unique ID for the test item using the function name
                const testId = `${group}:${testFunc.functionName}`;

                const fileUri = path.join(projectDir, testFunc.lineRange.fileName);

                // Create a test item for the test function
                const testItem = testController.createTestItem(testId, testFunc.functionName, Uri.file(fileUri));

                // Set the range for the test (optional, for navigation)
                const startPosition = new Position(
                    testFunc.lineRange.startLine.line, // Convert to 0-based line number
                    testFunc.lineRange.startLine.offset
                );
                const endPosition = new Position(
                    testFunc.lineRange.endLine.line, // Convert to 0-based line number
                    testFunc.lineRange.endLine.offset
                );
                testItem.range = new Range(startPosition, endPosition);

                // Add the test item to the group
                groupItem.children.add(testItem);
            }
        }
    } 
}

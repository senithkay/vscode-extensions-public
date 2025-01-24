'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { tests, Uri, Position, Range,  TestRunProfileKind } from "vscode";
import { BallerinaExtension } from "../../core";
import { KolaTestExecutorPositionsResponse, getDummyTestExecutorPositions } from "./discover";
import { runHandler } from "./runner";
import { activateEditKolaTest } from "./commands";


export async function activate(ballerinaExtInstance: BallerinaExtension) {
    activateEditKolaTest();

    const testController = tests.createTestController('kola-tests', 'Kola Tests');

    // create test profiles to display.
    testController.createRunProfile('Run Tests', TestRunProfileKind.Run, runHandler, true);
    testController.createRunProfile('Debug Tests', TestRunProfileKind.Debug, runHandler, true);

    const testsPositions: KolaTestExecutorPositionsResponse = getDummyTestExecutorPositions();

    if (testsPositions.executorPositions) {
        // Iterate over the groups and their associated tests
        for (const [groupName, executorPositions] of testsPositions.executorPositions) {
            // Create a test item for the group
            const groupId = `group:${groupName}`;
            const groupItem = testController.createTestItem(groupId, groupName);
            testController.items.add(groupItem);

            // Add each test under the group
            for (const executorPosition of executorPositions) {
                const testId = `test:${executorPosition.filePath}:${executorPosition.name}`;
                const testItem = testController.createTestItem(
                    testId,
                    executorPosition.name,
                    Uri.file(executorPosition.filePath)
                );

                // Set the range for the test (optional, for navigation)
                const startPosition = new Position(
                    executorPosition.range.startLine.line - 1, // Convert to 0-based line number
                    executorPosition.range.startLine.offset
                );
                const endPosition = new Position(
                    executorPosition.range.endLine.line - 1, // Convert to 0-based line number
                    executorPosition.range.endLine.offset
                );
                testItem.range = new Range(startPosition, endPosition);

                // Add the test to the group
                groupItem.children.add(testItem);

            }
        }
    }


    ballerinaExtInstance.context?.subscriptions.push(testController);
}

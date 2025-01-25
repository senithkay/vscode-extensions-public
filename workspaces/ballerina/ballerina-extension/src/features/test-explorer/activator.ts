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
import { runHandler } from "./runner";
import { activateEditKolaTest } from "./commands";
import { discoverTestFunctionsInProject } from "./discover";

export async function activate(ballerinaExtInstance: BallerinaExtension) {
    activateEditKolaTest();

    const testController = tests.createTestController('kola-tests', 'Kola Tests');

    // create test profiles to display.
    testController.createRunProfile('Run Tests', TestRunProfileKind.Run, runHandler, true);
    testController.createRunProfile('Debug Tests', TestRunProfileKind.Debug, runHandler, true);

    discoverTestFunctionsInProject(ballerinaExtInstance, testController);
    ballerinaExtInstance.context?.subscriptions.push(testController);
}



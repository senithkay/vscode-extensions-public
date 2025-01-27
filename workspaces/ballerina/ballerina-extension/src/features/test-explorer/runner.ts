'use strict';
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { exec } from 'child_process';
import { CancellationToken, TestRunRequest, TestMessage, TestRun, TestItem } from 'vscode';
import { testController } from './activator';
import { StateMachine } from "../../stateMachine";
import { isTestFunctionItem, isTestGroupItem } from './discover';
import { ballerinaExtInstance } from '../../core';


export async function runHandler(request: TestRunRequest, token: CancellationToken) {
    if (!request.include) {
        return;
    }
    const run = testController.createTestRun(request);

    request.include.forEach((test) => {
        if (token.isCancellationRequested) {
            run.skipped(test);
            return;
        }

        run.started(test);

        let command : string;
        if (isTestGroupItem(test)) {
            let allPassed = true;
            let count = 0;
            test.children.forEach(async (child) => {
                const functionName = child.label;
                const executor = ballerinaExtInstance.getBallerinaCmd();
                command = `${executor} test --tests ${functionName}`;
                runCommand(run, child, command, request).then(() => {
                    allPassed = allPassed && true;
                    count++;
                    endGroup(count, test, allPassed, run);
                }).catch(() => {
                    allPassed = allPassed && false;
                    count++;
                    endGroup(count, test, allPassed, run);
                });
            });
            
        } else if (isTestFunctionItem(test)) {
            const functionName = test.label;
            command = `bal test --tests ${functionName}`;
            async () => await runCommand(run, test, command, request);
        }
    });
}

function endGroup(count: number, test: TestItem, allPassed: boolean, run: TestRun) {
    if (count === test.children.size) {
        if (allPassed) {
            run.passed(test);
            run.end();
        } else {
            run.failed(test, new TestMessage('Some tests failed!'));
            run.end();
        }
    }
}

async function runCommand(run: TestRun, test: TestItem, command: string, request: TestRunRequest): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: StateMachine.context().projectUri }, (error, stdout, stderr) => {
            if (error) {
                // Report test failure
                run.failed(test, new TestMessage(stderr || 'Test failed!'));
                reject(new Error(stderr || 'Test failed!'));
            } else {
                // Report test success
                run.passed(test);
                resolve();
            }

            // End the test run if this is the last test
            if (test === request.include[request.include.length - 1]) {
                run.end();
            }
        });
    });
}

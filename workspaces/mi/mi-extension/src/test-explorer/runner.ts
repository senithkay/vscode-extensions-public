/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/**
 * Test explorer run and debug related funtions.
 */

import { Uri, CancellationToken, TestItem, TestMessage, TestRunProfileKind, TestRunRequest, window, MarkdownString } from "vscode";

import { discoverTests, gatherTestItems } from "./discover";
import { testController } from "./activator";
import path = require("path");
import { getProjectRoot } from "./helper";
import { getServerPath } from "../debugger/debugHelper";
import { TestRunnerConfig } from "./config";
import { ChildProcess } from "child_process";
import treeKill = require("tree-kill");
const fs = require('fs');
const child_process = require('child_process');

enum EXEC_ARG {
    TESTS = '--tests',
    COVERAGE = '--code-coverage'
}
enum TEST_STATUS {
    PASSED = 'PASSED',
    FAILED = 'FAILED'
}
const TEST_RESULTS_PATH = path.join("target", "unit-test-report.json").toString();

// run tests.
export function runHandler(request: TestRunRequest, cancellation: CancellationToken) {
    const queue: { test: TestItem; data: any; }[] = [];
    const run = testController.createTestRun(request);

    discoverTests(request, request.include ?? gatherTestItems(testController.items), queue).then(runTestQueue);

    async function runTestQueue() {

        if (queue.length === 0) {
            run.end();
            window.showErrorMessage("No tests found.");
            return;
        }
        const projectRoot = getProjectRoot(Uri.parse(queue[0].test.id));
        let stopTestServer: () => void;

        if (!projectRoot) {
            run.end();
            window.showErrorMessage("Project root not found.");
            return;
        }
        const startTime = Date.now();

        if (request.profile?.kind == TestRunProfileKind.Run) {
            run.appendOutput(`Start running tests\r\n`);

            let testNames = "";
            // mark tests as running in test explorer
            for (const { test, } of queue) {
                testNames = testNames == "" ? test.label : `${testNames},${test.label}`;
                markSatusAsRunning(test);
            }

            try {
                // execute test
                run.appendOutput(`Starting MI test server\r\n`);
                const { cp } = await startTestServer();
                stopTestServer = () => {
                    treeKill(cp.pid!, 'SIGKILL');
                }

                run.appendOutput("MI test server started\r\n");
                run.appendOutput(`Running tests ${testNames}\r\n`);

                // run tests
                await runTests(testNames, projectRoot);
                const EndTime = Date.now();
                const timeElapsed = (EndTime - startTime) / queue.length;

                // reading test results
                const testsJson: JSON | undefined = await readJsonFile(path.join(projectRoot, TEST_RESULTS_PATH).toString());
                if (!testsJson) {
                    for (const { test, } of queue) {
                        const testMessage: TestMessage = new TestMessage("Command failed");
                        run.failed(test, testMessage, timeElapsed);
                    }
                    window.showErrorMessage("Test results not found.");
                } else {

                    for (const { test, } of queue) {
                        let testResults;
                        let testCases;
                        if (test.id.endsWith(".xml")) {
                            testResults = testsJson[test.id];
                            testCases = test.children;
                        } else {
                            const strs = test.id.split("/");
                            strs.pop();
                            const suiteName = strs.join("/");
                            testResults = testsJson[suiteName];
                            testCases = [[test.id, test]]
                        }

                        if (!testResults) {
                            const testMessage: TestMessage = new TestMessage("Test result not found");
                            run.failed(test, testMessage, timeElapsed);
                            continue;
                        }

                        const mediationStatus = testResults["mediationStatus"];
                        const deploymentStatus = testResults["deploymentStatus"];
                        const testCasesResults = testResults["testCases"];

                        if (deploymentStatus === TEST_STATUS.PASSED && mediationStatus === TEST_STATUS.PASSED) {

                            for (const testCase of testCases) {
                                const testCaseItem = testCase[1];
                                const testCaseName = testCaseItem.label;
                                const testCaseResult = testCasesResults.find((testCaseResult: any) => testCaseResult["testCaseName"] === testCaseName);
                                if (testCaseResult) {
                                    const mediationStatus = testCaseResult["mediationStatus"];
                                    const assertionStatus = testCaseResult["assertionStatus"];
                                    if (mediationStatus === TEST_STATUS.PASSED && assertionStatus === TEST_STATUS.PASSED) {
                                        run.passed(testCaseItem, timeElapsed);
                                    } else {
                                        let message: TestMessage;
                                        if (assertionStatus === TEST_STATUS.FAILED) {
                                            const failureAssertions = testCaseResult["failureAssertions"];
                                            const table = new MarkdownString();
                                            table.appendMarkdown(`| Test Case | Assert Expression | Failure Message |\n`);
                                            table.appendMarkdown(`| --- | --- | --- |\n`);
                                            for (const assertion of failureAssertions) {
                                                const actualValue = assertion["actual"];
                                                const expectedValue = assertion["expected"];
                                                const failureMessage = `Expected: ${expectedValue}, Actual: ${actualValue}`
                                                table.appendMarkdown(`| ${testCaseName} | ${assertion["assertionExpression"]} | ${failureMessage} |\n`);
                                            }
                                            message = new TestMessage(table);
                                        } else {
                                            message = new TestMessage("Test mediation failed");
                                        }
                                        run.failed(testCaseItem, message, timeElapsed);
                                    }
                                } else {
                                    const testMessage: TestMessage = new TestMessage("Test result not found");
                                    run.failed(testCaseItem, testMessage, timeElapsed);
                                }
                            }
                            // run.passed(test, timeElapsed);
                        } else {
                            // test failed
                            const testMessage: TestMessage = new TestMessage("Mediation failed");
                            run.failed(test, testMessage, timeElapsed);
                        }
                    }
                }
            } catch (error: any) {
                // exception.
                window.showErrorMessage(`Error: ${error}`);
                run.appendOutput(`${error.toString().replace('\n', '\r\n')}\r\n`);
            }
            run.appendOutput(`Tests Completed\r\n`);
            run.end();
            if (stopTestServer!) {
                stopTestServer();
            }
        } else if (request.profile?.kind == TestRunProfileKind.Debug) {
            window.showWarningMessage("Test debugging is not yet supported.");
        }
    }

    function markSatusAsRunning(test: TestItem) {
        run.started(test);
        if (test.children) {
            for (const child of test.children) {
                markSatusAsRunning(child[1]);
            }
        }
    }
}

/**
 * Start test server.
 * @returns server output
 */
async function startTestServer(): Promise<{ cp: ChildProcess }> {
    return new Promise<{ cp: ChildProcess }>(async (resolve, reject) => {
        try {
            const serverPath = await getServerPath();

            if (!serverPath) {
                window.showErrorMessage("Server path not found");
                throw new Error("Server path not found");
            }
            const scriptFile = process.platform === "win32" ? "micro-integrator.bat" : "micro-integrator.sh";
            const server = path.join(serverPath, "bin", scriptFile);

            const serverCommand = `${server} -DsynapseTest`;

            const cp = runCommand(serverCommand, undefined, onData, onError, undefined);

            function onData(data: string) {
                if (data.includes("Micro Integrator started in")) {
                    resolve({ cp });
                }
                if (data.includes("Address already in use")) {
                    reject("Port already in use. Please stop the server and try again or update the port in the settings.");
                }
            }
            function onError(data: string) {
                window.showErrorMessage(data);
                reject(data);
            }

        } catch (error) {
            throw error;
        }
    });
}

async function runTests(testNames: string, projectRoot: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const mvnCmd = process.platform === "win32" ? "mvn.cmd" : "mvn";
        const testRunCmd = `${mvnCmd} test -DtestServerType=remote -DtestServerHost=${TestRunnerConfig.getHost()} -DtestServerPort=${TestRunnerConfig.getServerPort()} -P test`;

        const onData = (data: string) => {
            if (data.includes("Finished at:")) {
                resolve();
            }
        }
        const onError = (data: string) => {
            window.showErrorMessage(data);
            reject(data);
        }

        try {
            runCommand(testRunCmd, projectRoot, onData, onError);
        } catch (error) {
            throw error;
        }
    });
}

/**
 * Run terminal command.
 * @param command Command to run.
 * @param pathToRun Path to execute the command.
 * @param returnData Indicates whether to return the stdout
 */
export function runCommand(command, pathToRun?: string, onData?: (data: string) => void, onError?: (data: string) => void, onClose?: (code: number) => void): ChildProcess {
    try {
        if (pathToRun) {
            command = `cd ${pathToRun} && ${command}`
        }
        const cp = child_process.spawn(command, [], { shell: true });

        if (typeof onData === 'function') {
            cp.stdout.setEncoding('utf8');
            cp.stdout.on('data', onData);
        }

        if (typeof onError === 'function') {
            cp.stderr.on('data', onError);
            cp.on('error', onError);
        }

        if (typeof onClose === 'function') {
            cp.on('close', onClose);
        }

        return cp;
    } catch (error) {
        console.error('Failed to spawn process:', error);
        throw error;
    }
}

/** 
 * Read test json output.
 * @param file File path of the json.
 */
export async function readJsonFile(path: string): Promise<JSON | undefined> {
    try {
        let rawdata = fs.readFileSync(path);
        return JSON.parse(rawdata);
    } catch {
        return undefined;
    }
}

/**
 * Start debugging
 */
export async function startDebugging(uri: Uri, testDebug: boolean, args: any[])
    : Promise<void> {
    throw new Error("Method not implemented.");
}

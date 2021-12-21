'use strict';
/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/**
 * Test explorer implemntation.
 */
import {
  CancellationToken, debug, DebugConfiguration, Position, Range,
  RelativePattern,
  TestController, TestItem, TestItemCollection, TestMessage, TestRunProfileKind, TestRunRequest,
  tests, TextDocument, Uri, window, workspace, WorkspaceFolder
} from 'vscode';
import { BallerinaExtension, ExecutorPosition, ExtendedLangClient, LANGUAGE, } from "../core";
import { BALLERINA_COMMANDS } from '../project';
import fileUriToPath from 'file-uri-to-path';
import { DEBUG_REQUEST, DEBUG_CONFIG } from '../debugger';
import child_process from 'child_process';
import path from 'path';
import { debug as log } from '../utils';

enum EXEC_POSITION_TYPE {
  SOURCE = 'source',
  TEST = 'test'
}
enum EXEC_ARG {
  TESTS = '--tests',
  COVERAGE = '--code-coverage'
}
enum TEST_STATUS {
  PASSED = 'PASSED',
  FAILED = 'FAILURE'
}

const fs = require('fs');
const TEST_RESULTS_PATH = path.join("target", "report", "test_results.json").toString();
let langClient: ExtendedLangClient | undefined;
let currentProjectRoot;
let ctrl;
let root;

export async function activate(ballerinaExtInstance: BallerinaExtension) {
  ctrl = tests.createTestController('ballerina-tests', 'Ballerina Tests');
  ballerinaExtInstance.context?.subscriptions.push(ctrl);

  langClient = ballerinaExtInstance.langClient;

  // run tests.
  const runHandler = (request: TestRunRequest, cancellation: CancellationToken) => {
    const queue: { test: TestItem; data: any }[] = [];
    const run = ctrl.createTestRun(request);

    const discoverTests = async (tests: Iterable<TestItem>) => {
      for (const test of tests) {
        if (request.exclude?.includes(test)) {
          continue;
        }

        if (test.canResolveChildren) {
          await discoverTests(gatherTestItems(test.children));
        } else {
          queue.push({ test: test, data: null });
        }
      }
    };

    const runTestQueue = async () => {
      if (!root) {
        run.end();
        return;
      }

      const startTime = Date.now();
      run.appendOutput(`Running Tests\r\n`);

      if (request.profile?.kind == TestRunProfileKind.Run) {
        let testNames = "";
        for (const { test, } of queue) {
          testNames = testNames == "" ? test.label : `${testNames},${test.label}`;
          run.started(test);
        }
        let testsJson: JSON | undefined = undefined;
        try {
          // execute test
          const executor = ballerinaExtInstance.getBallerinaCmd();
          const commandText = `${executor} ${BALLERINA_COMMANDS.TEST} ${EXEC_ARG.TESTS} ${testNames} ${EXEC_ARG.COVERAGE}`;
          await runCommand(commandText, root);

        } catch {
          // exception.
        } finally {
          const EndTime = Date.now();

          testsJson = await readTestJson(path.join(root!, TEST_RESULTS_PATH).toString());
          if (!testsJson) {
            run.end();
            return;
          }

          const moduleStatus = testsJson["moduleStatus"];
          const timeElapsed = (EndTime - startTime) / queue.length;

          for (const { test, } of queue) {
            let found = false;
            for (const status of moduleStatus) {
              const testResults = status["tests"];
              for (const testResult of testResults) {
                if (test.label !== testResult.name) {
                  continue;
                }

                if (testResult.status === TEST_STATUS.PASSED) {
                  run.passed(test, timeElapsed);
                  found = true;
                  break;
                } else if (testResult.status === TEST_STATUS.FAILED) {
                  // test failed
                  const testMessage: TestMessage = new TestMessage(testResult.failureMessage);
                  run.failed(test, testMessage, timeElapsed);
                  found = true;
                  break;
                }
              }
              if (found) {
                break;
              }
              // test failed
              const testMessage: TestMessage = new TestMessage("");
              run.failed(test, testMessage, timeElapsed);
            }
          }
        }
      } else if (request.profile?.kind == TestRunProfileKind.Debug) {
        for (const { test, } of queue) {
          if (window.activeTextEditor) {
            // Debugs tests.
            await startDebugging(window.activeTextEditor.document.uri, true,
              ballerinaExtInstance.getBallerinaCmd(),
              ballerinaExtInstance.getBallerinaHome(), [test.label]);

          }
        }
      }
      run.appendOutput(`Tests Completed\r\n`);

      run.end();
    };

    discoverTests(request.include ?? gatherTestItems(ctrl.items)).then(runTestQueue);
  };

  // create test profiles to display.
  ctrl.createRunProfile('Run Tests', TestRunProfileKind.Run, runHandler, true);
  ctrl.createRunProfile('Debug Tests', TestRunProfileKind.Debug, runHandler, true);

  async function updateNodeForDocument(document: TextDocument) {
    if (document.uri.scheme !== 'file' || !document.uri.path.endsWith('.bal')) {
      return;
    }

    await createTests(document.uri);
  }

  for (const document of workspace.textDocuments) {
    updateNodeForDocument(document);
  }

  ballerinaExtInstance.context?.subscriptions.push(
    workspace.onDidOpenTextDocument(updateNodeForDocument),
    workspace.onDidChangeTextDocument(e => updateNodeForDocument(e.document)),
    workspace.onDidSaveTextDocument(doc => updateNodeForDocument(doc)),
  );

  if (!langClient) {
    return;
  }

  langClient.onReady().then(() => {
    startWatchingWorkspace(ctrl);
    if (!window.activeTextEditor) {
      return;
    }
    updateNodeForDocument(window.activeTextEditor.document);
  });
}

/** 
 * Run terminal command.
 * @param command Command to run.
 * @param pathToRun Path to execute the command.
 */
async function runCommand(command, pathToRun: string | undefined) {
  return new Promise<string>(function (resolve, reject) {
    if (pathToRun == undefined) {
      return;
    } else if (pathToRun.endsWith(".bal")) {
      const lastIndex = pathToRun.lastIndexOf(path.sep);
      pathToRun = pathToRun.slice(0, lastIndex);
    }
    child_process.exec(`${command}`, { cwd: pathToRun }, async (err, stdout, stderr) => {
      if (err) {
        log(`error: ${err}`);
        window.showInformationMessage(
          err.message
        );
        reject(err);
      } else {
        resolve("OK");
      }
    });
  });
}

/** 
 * Run terminal command.
 * @param file File path of the json.
 */
async function readTestJson(file): Promise<JSON | undefined> {
  try {
    let rawdata = fs.readFileSync(file);
    return JSON.parse(rawdata);
  } catch {
    return undefined;
  }
}

async function startDebugging(uri: Uri, testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
  : Promise<void> {
  const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(uri);
  const debugConfig: DebugConfiguration = await constructDebugConfig(testDebug, ballerinaCmd,
    ballerinaHome, args);
  return debug.startDebugging(workspaceFolder, debugConfig).then(
    // Wait for debug session to be complete.
    () => {
      return new Promise<void>((resolve) => {
        debug.onDidTerminateDebugSession(() => {
          resolve();
        });
      });
    },
    (ex) => log('Failed to start debugging tests' + ex),
  );
}

/** 
 * Find and create tests.
 * @param controller Test Controller.
 * @param uri File uri to find tests.
 * @param ballerinaExtInstance Balleina extension instace.
 */
export async function createTests(uri: Uri) {
  if (!langClient || !ctrl) {
    return;
  }

  // create tests for current project
  root = (await langClient.getBallerinaProject({
    documentIdentifier: {
      uri: uri.toString()
    }
  })).path;

  if (!root) {
    return;
  }

  if (!uri.fsPath.startsWith(root)) {
    return;
  }

  if (currentProjectRoot && currentProjectRoot !== root) {
    ctrl.items.forEach(item => {
      ctrl.items.delete(item.id);
    });
  }
  currentProjectRoot = root;

  // Get tests from LS.
  langClient.getExecutorPositions({
    documentIdentifier: {
      uri: uri.toString()
    }
  }).then(async response => {
    if (!response.executorPositions) {
      return;
    }

    let positions: ExecutorPosition[] = [];
    response.executorPositions.forEach(position => {
      if (position.kind === EXEC_POSITION_TYPE.TEST) {
        positions.push(position);
      }
    });

    if (positions.length === 0) {
      return;
    }

    const ancestors: TestItem[] = [];

    let relativePath = path.relative(root!, uri.fsPath).toString().split(path.sep);

    let level = relativePath[0];
    let fullPath = path.join(root!, level).toString();
    let depth = 0;

    // if already added to the test explorer.
    let rootNode = ctrl.items.get(fullPath);
    if (rootNode) {
      let parentNode: TestItem = rootNode;
      let pathToFind = uri.fsPath;
      while (pathToFind != '') {
        parentNode = getTestItemNode(rootNode, pathToFind);
        if (parentNode.id == pathToFind) {
          relativePath = path.relative(pathToFind, uri.fsPath).split(path.sep);
          break;
        }
        const lastIndex = pathToFind.lastIndexOf(path.sep);
        pathToFind = pathToFind.slice(0, lastIndex);
      }

      if (parentNode && parentNode.id === uri.fsPath) {
        let testCaseItems: TestItem[] = [];

        positions.forEach(position => {
          const tcase = createTestCase(ctrl, fullPath, position);
          testCaseItems.push(tcase);
        });
        parentNode.children.replace(testCaseItems);

        return;
      } else {
        rootNode = parentNode;
        ancestors.push(rootNode);
        depth = 0;
      }
    } else {
      rootNode = createTestItem(ctrl, fullPath, fullPath, level);
      ctrl.items.add(rootNode);
      ancestors.push(rootNode);
      depth = 1;
    }

    for (depth; depth < relativePath.length; depth++) {
      const parent = ancestors.pop()!;
      const level = relativePath[depth];
      fullPath = path.join(fullPath, level).toString();
      const middleNode = createTestItem(ctrl, fullPath, fullPath, level);
      middleNode.canResolveChildren = true;
      parent.children.add(middleNode);
      ancestors.push(middleNode);
    }

    const parent = ancestors.pop()!;
    let testCaseItems: TestItem[] = [];
    positions.forEach(position => {
      const tcase = createTestCase(ctrl, fullPath, position);
      testCaseItems.push(tcase);
    });
    parent.children.replace(testCaseItems);

    rootNode.canResolveChildren = true;
  }, _error => {
  });
}

/**
 * Create folder level node in test explorer tree. 
 */
function createTestCase(controller: TestController, fullPath: string, position: ExecutorPosition) {
  const tcase = createTestItem(controller, `${fullPath}/${position.name}`, fullPath, position.name);
  tcase.canResolveChildren = false;
  tcase.range = new Range(new Position(position.range.startLine.line, position.range.startLine.offset),
    new Position(position.range.endLine.line, position.range.endLine.offset));
  return tcase;
}

/**
 * Create test item. 
 */
function createTestItem(controller: TestController, id: string, path: string, label: string): TestItem {
  const uri = Uri.file(path);
  const item = controller.createTestItem(id, label, uri);
  item.canResolveChildren = true;
  return item;
}

/**
 * Get parent node of a test item. This may return invalid parent node 
 * if the parent is not found. Always check the parent id with the returned
 * parent's id to validate.
 */
function getTestItemNode(testNode: TestItem, id: string):
  TestItem {
  if (testNode.canResolveChildren && testNode.id === id) {
    return testNode;
  }

  testNode.children.forEach((c) => {
    if (testNode.canResolveChildren) {
      testNode = getTestItemNode(c, id);
    }
  });
  return testNode;
}

function gatherTestItems(collection: TestItemCollection) {
  const items: TestItem[] = [];
  collection.forEach(item => items.push(item));
  return items;
}

function startWatchingWorkspace(controller: TestController) {
  if (!workspace.workspaceFolders) {
    return [];
  }

  return workspace.workspaceFolders.map(workspaceFolder => {
    const pattern = new RelativePattern(workspaceFolder, '**/*.bal');
    const watcher = workspace.createFileSystemWatcher(pattern);

    watcher.onDidCreate(uri => createTests(uri));
    watcher.onDidChange(async uri => {
      await createTests(uri);
    });
    watcher.onDidDelete(uri => controller.items.delete(uri.toString()));

    workspace.findFiles(pattern).then(async files => {
      for (const fileX of files) {
        await createTests(fileX);
      }
    });

    return watcher;
  });
}

async function constructDebugConfig(testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
  : Promise<DebugConfiguration> {

  let programArgs = [];
  let commandOptions = [];
  let env = {};
  const debugConfigs: DebugConfiguration[] = workspace.getConfiguration(DEBUG_REQUEST.LAUNCH).configurations;
  if (debugConfigs.length > 0) {
    let debugConfig: DebugConfiguration | undefined;
    for (let i = 0; i < debugConfigs.length; i++) {
      if ((testDebug && debugConfigs[i].name == DEBUG_CONFIG.TEST_DEBUG_NAME) ||
        (!testDebug && debugConfigs[i].name == DEBUG_CONFIG.SOURCE_DEBUG_NAME)) {
        debugConfig = debugConfigs[i];
        break;
      }
    }
    if (debugConfig) {
      if (debugConfig.programArgs) {
        programArgs = debugConfig.programArgs;
      }
      if (debugConfig.commandOptions) {
        commandOptions = debugConfig.commandOptions;
      }
      if (debugConfig.env) {
        env = debugConfig.env;
      }
    }
  }

  const debugConfig: DebugConfiguration = {
    type: LANGUAGE.BALLERINA,
    name: testDebug ? DEBUG_CONFIG.TEST_DEBUG_NAME : DEBUG_CONFIG.SOURCE_DEBUG_NAME,
    request: DEBUG_REQUEST.LAUNCH,
    script: fileUriToPath(window.activeTextEditor!.document.uri.toString()),
    networkLogs: false,
    debugServer: '10001',
    debuggeePort: '5010',
    'ballerina.home': ballerinaHome,
    'ballerina.command': ballerinaCmd,
    debugTests: testDebug,
    tests: testDebug ? args : [],
    programArgs,
    commandOptions,
    env,
    capabilities: { supportsReadOnlyEditors: true }
  };
  return debugConfig;
}

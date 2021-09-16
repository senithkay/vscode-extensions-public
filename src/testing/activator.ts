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
import { getCurrentBallerinaProject } from '../utils/project-utils';
import * as vscode from 'vscode';
import { BallerinaExtension, ExecutorPosition, LANGUAGE, } from "../core";
import { BALLERINA_COMMANDS } from '../project';
import { EXEC_ARG, EXEC_POSITION_TYPE } from '../editor-support/codelens-provider';
import fileUriToPath from 'file-uri-to-path';
import { DEBUG_REQUEST, DEBUG_CONFIG } from '../debugger';

export async function activate(ballerinaExtInstance: BallerinaExtension) {
  const ctrl = vscode.tests.createTestController('ballerina-tests', 'Ballerina Tests');
  ballerinaExtInstance.context?.subscriptions.push(ctrl);

  // run tests.
  const runHandler = (request: vscode.TestRunRequest, cancellation: vscode.CancellationToken) => {
    const queue: { test: vscode.TestItem; data: any }[] = [];
    const run = ctrl.createTestRun(request);
    // map of file uris to statments on each line:
    const coveredLines = new Map</* file uri */ string, (vscode.StatementCoverage | undefined)[]>();

    const discoverTests = async (tests: Iterable<vscode.TestItem>) => {
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
      for (const { test, } of queue) {
        run.appendOutput(`Running ${test.id}\r\n`);
        if (cancellation.isCancellationRequested) {
          run.skipped(test);
        } else {
          run.started(test);

          const start = Date.now();

          if (request.profile?.kind == vscode.TestRunProfileKind.Run) {
            try {
              // execute test
              const executor = ballerinaExtInstance.getBallerinaCmd();
              const commandText = `${executor} ${BALLERINA_COMMANDS.TEST} ${EXEC_ARG.TESTS} ${test.label}`;
              const path = (await getCurrentBallerinaProject()).path;
              await runCommand(commandText, path);
              run.passed(test, Date.now() - start);
            } catch (e) {
              // test failed
              let testMessage: vscode.TestMessage;
              if (e instanceof Error) {
                testMessage = new vscode.TestMessage(e.message);
              } else {
                testMessage = new vscode.TestMessage("");
              }
              run.failed(test, testMessage, Date.now() - start);
            }
          } else if (request.profile?.kind == vscode.TestRunProfileKind.Debug) {
            // Debugs tests.
            await startDebugging(vscode.window.activeTextEditor!.document.uri, true, ballerinaExtInstance.getBallerinaCmd(),
              ballerinaExtInstance.getBallerinaHome(), [test.label]);
          }
        }

        const lineNo = test.range!.start.line;
        const fileCoverage = coveredLines.get(test.uri!.toString());
        if (fileCoverage) {
          fileCoverage[lineNo]!.executionCount++;
        }

        run.appendOutput(`Completed ${test.id}\r\n`);
      }

      run.end();
    };

    run.coverageProvider = {
      provideFileCoverage() {
        const coverage: vscode.FileCoverage[] = [];
        for (const [uri, statements] of coveredLines) {
          coverage.push(
            vscode.FileCoverage.fromDetails(
              vscode.Uri.parse(uri),
              statements.filter((s): s is vscode.StatementCoverage => !!s)
            )
          );
        }

        return coverage;
      },
    };

    discoverTests(request.include ?? gatherTestItems(ctrl.items)).then(runTestQueue);
  };

  // create test profiles to display.
  ctrl.createRunProfile('Run Tests', vscode.TestRunProfileKind.Run, runHandler, true);
  ctrl.createRunProfile('Debug Tests', vscode.TestRunProfileKind.Debug, runHandler, true);

  ctrl.resolveHandler = async item => {
    if (!item) {
      ballerinaExtInstance.context?.subscriptions.push(...startWatchingWorkspace(ctrl, ballerinaExtInstance));
      return;
    }
  };

  async function updateNodeForDocument(e: vscode.TextDocument) {
    if (e.uri.scheme !== 'file') {
      return;
    }

    if (!e.uri.path.endsWith('.bal')) {
      return;
    }

    await createTests(ctrl, e.uri, ballerinaExtInstance);
  }

  for (const document of vscode.workspace.textDocuments) {
    updateNodeForDocument(document);
  }

  ballerinaExtInstance.context?.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateNodeForDocument),
    vscode.workspace.onDidChangeTextDocument(e => updateNodeForDocument(e.document)),
    vscode.workspace.onDidSaveTextDocument(doc => updateNodeForDocument(doc)),
  );
}

/** 
 * Run terminal command.
 * @param command Command to run.
 * @param path Path to execute the command.
 */
async function runCommand(command, path: string | undefined) {
  return new Promise<string>(function (resolve, reject) {
    const cp = require('child_process');
    if (path == undefined) {
      return;
    } else if (path.endsWith(".bal")) {
      const lastIndex = path.lastIndexOf("/");
      path = path.slice(0, lastIndex);
    }
    cp.exec(`${command}`, { cwd: path }, (err, stdout, stderr) => {
      if (err) {
        console.log('error: ' + err);
        reject(err);
      } else {
        resolve("OK");
      }
    });
  });
}

async function startDebugging(uri: vscode.Uri, testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
  : Promise<void> {
  const workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(uri);
  const debugConfig: vscode.DebugConfiguration = await constructDebugConfig(testDebug, ballerinaCmd,
    ballerinaHome, args);
  return vscode.debug.startDebugging(workspaceFolder, debugConfig).then(
    // Wait for debug session to be complete.
    () => {
      return new Promise<void>((resolve) => {
        vscode.debug.onDidTerminateDebugSession(() => {
          resolve();
        });
      });
    },
    (ex) => console.log('Failed to start debugging tests', ex),
  );
}

/** 
 * Find and create tests.
 * @param controller Test Controller.
 * @param uri File uri to find tests.
 * @param ballerinaExtInstance Balleina extension instace.
 */
async function createTests(controller: vscode.TestController, uri: vscode.Uri, ballerinaExtInstance: BallerinaExtension) {
  // Get tests from LS.
  await ballerinaExtInstance.langClient!.getExecutorPositions({
    documentIdentifier: {
      uri: uri.toString()
    }
  }).then(response => {
    let positions: ExecutorPosition[] = [];
    response.executorPositions!.forEach(position => {
      if (position.kind === EXEC_POSITION_TYPE.TEST) {
        positions.push(position);
      }
    });
    if (positions.length > 0) {
      const ancestors: vscode.TestItem[] = [];

      var path = require('path');
      let root;
      vscode.workspace.workspaceFolders?.map(folder => { root = folder.uri.path });
      let relativePath = path.relative(root, uri.fsPath).split('/');

      let level = relativePath[0];
      let fullPath = `${root}/${level}`;
      let depth = 0;

      // if already added to the test explorer.
      let rootNode = controller.items.get(fullPath);
      if (rootNode) {
        let parentNode: vscode.TestItem = rootNode;
        let pathToFind = uri.fsPath;
        while (pathToFind != '') {
          parentNode = getTestItemNode(rootNode, pathToFind);
          if (parentNode.id == pathToFind) {
            relativePath = path.relative(pathToFind, uri.fsPath).split('/');
            break;
          }
          const lastIndex = pathToFind.lastIndexOf("/");
          pathToFind = pathToFind.slice(0, lastIndex);
        }

        if (parentNode && parentNode.id === uri.fsPath) {
          let testCaseItems: vscode.TestItem[] = [];
          response.executorPositions!.forEach(position => {

            const tcase = createTestCase(controller, fullPath, position);
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
        rootNode = createTestItem(controller, fullPath, fullPath, level);
        controller.items.add(rootNode);
        ancestors.push(rootNode);
        depth = 1;
      }

      for (depth; depth < relativePath.length; depth++) {
        const parent = ancestors.pop()!;
        const level = relativePath[depth];
        fullPath = `${fullPath}/${level}`;
        const middleNode = createTestItem(controller, fullPath, fullPath, level);
        middleNode.canResolveChildren = true;
        parent.children.add(middleNode);
        ancestors.push(middleNode);
      }

      const parent = ancestors.pop()!;
      let testCaseItems: vscode.TestItem[] = [];
      positions.forEach(position => {
        const tcase = createTestCase(controller, fullPath, position);
        testCaseItems.push(tcase);
      });
      parent.children.replace(testCaseItems);

      rootNode.canResolveChildren = true;
    }
  }, _error => {
  });
}

/**
 * Create folder level node in test explorer tree. 
 */
function createTestCase(controller: vscode.TestController, fullPath: string, position: ExecutorPosition) {
  const tcase = createTestItem(controller, `${fullPath}/${position.name}`, fullPath, position.name);
  tcase.canResolveChildren = false;
  tcase.range = new vscode.Range(new vscode.Position(position.range.startLine.line, position.range.startLine.offset),
    new vscode.Position(position.range.endLine.line, position.range.endLine.offset));
  return tcase;
}

/**
 * Create test item. 
 */
function createTestItem(controller: vscode.TestController, id: string, path: string, label: string): vscode.TestItem {
  const uri = vscode.Uri.file(path);
  const item = controller.createTestItem(id, label, uri);
  item.canResolveChildren = true;
  return item;
}

/**
 * Get parent node of a test item. This may return invalid parent node 
 * if the parent is not found. Always check the parent id with the returned
 * parent's id to validate.
 */
function getTestItemNode(testNode: vscode.TestItem, id: string): vscode.
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

function gatherTestItems(collection: vscode.TestItemCollection) {
  const items: vscode.TestItem[] = [];
  collection.forEach(item => items.push(item));
  return items;
}

function startWatchingWorkspace(controller: vscode.TestController, ballerinaExtInstance: BallerinaExtension) {
  if (!vscode.workspace.workspaceFolders) {
    return [];
  }

  return vscode.workspace.workspaceFolders.map(workspaceFolder => {
    const pattern = new vscode.RelativePattern(workspaceFolder, '**/*.bal');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidCreate(uri => createTests(controller, uri, ballerinaExtInstance));
    watcher.onDidChange(async uri => {
      await createTests(controller, uri, ballerinaExtInstance);
    });
    watcher.onDidDelete(uri => controller.items.delete(uri.toString()));

    vscode.workspace.findFiles(pattern).then(async files => {
      for (const fileX of files) {
        await createTests(controller, fileX, ballerinaExtInstance);
      }
    });

    return watcher;
  });
}

async function constructDebugConfig(testDebug: boolean, ballerinaCmd: string, ballerinaHome: string, args: any[])
  : Promise<vscode.DebugConfiguration> {

  let programArgs = [];
  let commandOptions = [];
  let env = {};
  const debugConfigs: vscode.DebugConfiguration[] = vscode.workspace.getConfiguration(DEBUG_REQUEST.LAUNCH).configurations;
  if (debugConfigs.length > 0) {
    let debugConfig: vscode.DebugConfiguration | undefined;
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

  const debugConfig: vscode.DebugConfiguration = {
    type: LANGUAGE.BALLERINA,
    name: testDebug ? DEBUG_CONFIG.TEST_DEBUG_NAME : DEBUG_CONFIG.SOURCE_DEBUG_NAME,
    request: DEBUG_REQUEST.LAUNCH,
    script: fileUriToPath(vscode.window.activeTextEditor!.document.uri.toString()),
    networkLogs: false,
    debugServer: '10001',
    debuggeePort: '5010',
    'ballerina.home': ballerinaHome,
    'ballerina.command': ballerinaCmd,
    debugTests: testDebug,
    tests: testDebug ? args : [],
    programArgs,
    commandOptions,
    env
  };
  return debugConfig;
}

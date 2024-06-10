/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import path = require("path");
import { TestController, tests, TestRunProfileKind, Uri, TestItem, ExtensionContext, commands } from "vscode";
import { runHandler } from "./runner";
import { createTestsForAllFiles, testFileMatchPattern } from "./discover";
import { getProjectName, getProjectRoot, startWatchingWorkspace } from "./helper";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { COMMANDS } from "../constants";
import { openView } from '../stateMachine';
import { activateMockServiceTreeView } from "./mock-services/activator";

export let testController: TestController;
const testSuiteNodes: string[] = [];

export async function activateTextExplorer(extensionContext: ExtensionContext) {
    testController = tests.createTestController('synapse-tests', 'Synapse Tests');
    extensionContext.subscriptions.push(testController);

    // create test profiles to display.
    testController.createRunProfile('Run Tests', TestRunProfileKind.Run, runHandler, true);
    testController.createRunProfile('Debug Tests', TestRunProfileKind.Debug, runHandler, true);

    testController.refreshHandler = async () => {
        createTestsForAllFiles();
    };
    createTestsForAllFiles();

    // search for all the tests.
    startWatchingWorkspace(testFileMatchPattern, createTestsForAllFiles);

    commands.registerCommand(COMMANDS.ADD_TEST_SUITE, () => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TestSuiteForm }, false);
        console.log('Add Test suite');
    });

    commands.registerCommand(COMMANDS.ADD_TEST_CASE, (entry: TestItem) => {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.TestCaseForm, documentUri: entry.uri?.fsPath }, false);
        console.log('Add Test Case');
    });

    activateMockServiceTreeView(extensionContext);
}

/** 
 * Find and create tests.
 * @param controller Test Controller.
 * @param uri File uri to find tests.
 * @param ballerinaExtInstance Balleina extension instace.
 */
export async function createTests(uri: Uri) {
    const projectRoot = getProjectRoot(uri);
    const projectName = getProjectName(uri);

    if (!testController || !projectRoot || !projectName) {
        return;
    }
    const testsRoot = path.join(projectRoot, "src", "test");

    let relativePath = path.relative(testsRoot, uri.fsPath).toString().split(path.sep);

    const ancestors: TestItem[] = [];

    // uncomment to add project name as parent
    // if already added to the test explorer.
    // let projectNode = testController.items.get(testsRoot);
    // if (!projectNode) {
    //     projectNode = createTestItem(testController, testsRoot, projectName);
    //     await setCanAddTestSuite(testsRoot);
    //     testController.items.add(projectNode);
    // }
    // ancestors.push(projectNode);

    // let parentNode: TestItem = projectNode;
    let parentNode: TestItem | undefined;
    const testPath = uri.fsPath;

    const currentItems = testController.items;
    currentItems.forEach((item) => {
        if (testPath.includes(item.id) && item.canResolveChildren) {
            parentNode = getParentNode(item, testPath);
        }

    });

    if (parentNode) {
        ancestors.push(parentNode);
        relativePath = path.relative(parentNode.id, testPath).split(path.sep);
    }

    // parentNode = getParentNode(projectNode, testPath);
    // if (projectNode !== parentNode) {
    //     ancestors.push(parentNode);
    //     relativePath = path.relative(parentNode.id, testPath).split(path.sep);
    // }

    for (let i = 0; i < relativePath.length; i++) {
        const parent = ancestors[ancestors.length - 1];
        const level = relativePath[i];
        const currentPath = parent ? path.join(parent.id, level).toString() : path.join(testsRoot, level).toString();

        let node;
        if (i < relativePath.length - 1) {
            node = createTestItem(testController, currentPath, level, true);
            await setCanAddTestSuite(currentPath);
        } else {
            node = createTestItem(testController, currentPath, level.split(".xml")[0], false);
        }
        parent ? parent.children.add(node) : testController.items.add(node);
        ancestors.push(node);
    }
}

async function setCanAddTestSuite(id: string) {
    if (!testSuiteNodes.includes(id)) {
        testSuiteNodes.push(id);
    }
    await commands.executeCommand('setContext', 'test.canAddTestSuite', testSuiteNodes);
}

/**
 * Create test item for file. 
 */
//   function createTestCase(controller: TestController, position: ExecutorPosition) {
//     const tcase = createTestItem(controller, `${position.filePath}/${position.name}`, position.filePath, position.name);
//     tcase.canResolveChildren = false;
//     tcase.range = new Range(new Position(position.range.startLine.line, position.range.startLine.offset),
//       new Position(position.range.endLine.line, position.range.endLine.offset));
//     return tcase;
//   }

/**
 * Create test tree item. 
 */
function createTestItem(controller: TestController, id: string, label: string, canResolveChildren: boolean, path?: string): TestItem {
    let uri: Uri | undefined;
    if (path) {
        uri = Uri.file(path);
    }
    const item = controller.createTestItem(id, label, uri);
    item.canResolveChildren = canResolveChildren ?? false;
    return item;
}

/**
 * Get parent node of a test item. This may return invalid parent node 
 * if the parent is not found. Always check the parent id with the returned
 * parent's id to validate.
 */
function getParentNode(testNode: TestItem, pathToSearch: string):
    TestItem | undefined {
    if (!testNode.canResolveChildren) {
        return;
    }

    testNode.children.forEach((node) => {
        if (pathToSearch.includes(node.id)) {
            return getParentNode(node, pathToSearch);
        }
    });
    return testNode;
}

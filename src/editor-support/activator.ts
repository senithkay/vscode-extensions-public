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

import { isSupportedVersion, VERSION } from "../utils";
import { languages, workspace } from "vscode";
import { BallerinaExtension, LANGUAGE } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { ReadOnlyContentProvider } from "./readonly-content-provider";
import { StringSplitFeature, StringSplitter } from "./split-provider";
import * as gitStatus from "./git-status";

export function activate(ballerinaExtInstance: BallerinaExtension) {
    if (!ballerinaExtInstance.context || !ballerinaExtInstance.langClient) {
        return;
    }
    if (isSupportedVersion(ballerinaExtInstance, VERSION.ALPHA, 5)) {
        ballerinaExtInstance.context!.subscriptions.push(new StringSplitFeature(new StringSplitter(),
            ballerinaExtInstance));
    }

    // Create new content provider for ballerina library files
    const blProvider = new ReadOnlyContentProvider();
    ballerinaExtInstance.context.subscriptions.push(workspace.registerTextDocumentContentProvider('bala', blProvider));

    gitStatus.activate(ballerinaExtInstance);

    if (!ballerinaExtInstance.isAllCodeLensEnabled()) {
        return;
    }
    if ((ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled()) &&
        isSupportedVersion(ballerinaExtInstance, VERSION.BETA, 1)) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }],
            new ExecutorCodeLensProvider(ballerinaExtInstance));
    }
}

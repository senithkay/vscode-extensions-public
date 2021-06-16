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

import { languages } from "vscode";
import { BallerinaExtension, LANGUAGE } from "../core";
import { ExecutorCodeLensProvider } from "./codelens-provider";
import { ReadOnlyFileProvider } from "./readonly-file-provider";
import { StringSplitFeature, StringSplitter } from "./split-provider";

export function activate(ballerinaExtInstance: BallerinaExtension) {
    if (!ballerinaExtInstance.context || !ballerinaExtInstance.langClient || !ballerinaExtInstance.isSwanLake()) {
        return;
    }
    ballerinaExtInstance.context!.subscriptions.push(new StringSplitFeature(new StringSplitter(),
        ballerinaExtInstance));

    if (ballerinaExtInstance.isAllCodeLensEnabled() || ballerinaExtInstance.isExecutorCodeLensEnabled()) {
        languages.registerCodeLensProvider([{ language: LANGUAGE.BALLERINA }], new ExecutorCodeLensProvider(ballerinaExtInstance));
    }

    // Create a read only file provider
    new ReadOnlyFileProvider(ballerinaExtInstance).markReadOnlyFiles();
}

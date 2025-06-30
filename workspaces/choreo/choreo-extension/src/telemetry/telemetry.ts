/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */

import { TelemetryReporter } from "@vscode/extension-telemetry";
import type { TelemetryReporter as TelemetryReporterType } from "@vscode/extension-telemetry";
import type * as vscode from "vscode";

// TODO: replace with connection string
const key = "8f98bf03-9ba8-47ba-a18d-62449b92ca42";

// telemetry reporter
let reporter: TelemetryReporterType;

export function activateTelemetry(context: vscode.ExtensionContext) {
	reporter = new TelemetryReporter(key);
	context.subscriptions.push(reporter);
}

export function getTelemetryReporter() {
	return reporter;
}

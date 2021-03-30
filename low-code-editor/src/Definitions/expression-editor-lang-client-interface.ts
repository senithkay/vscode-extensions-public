/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { Diagnostic } from "monaco-languageclient";

import { BaseLangClientInterface } from "./base-lang-client-interface";
import { BallerinaProjectParams } from "./lang-client-extended";

export interface CompletionParams {
	textDocument: {
		uri: string;
	};
	position: {
		character: number;
		line: number;
	};
	context: {
		triggerKind: number;
	};
}

export interface CompletionResponse {
	detail: string;
	insertText: string;
	insertTextFormat: number;
	kind: number;
	label: string;
}

export interface PublishDiagnosticsParams {
	uri: string;
	diagnostics: Diagnostic[];
}

export interface ExpressionEditorLangClientInterface extends BaseLangClientInterface {
	diagnostics: (
		params: BallerinaProjectParams
	) => Thenable<PublishDiagnosticsParams[]>;
	getCompletion: (params: CompletionParams) => Thenable<CompletionResponse[]>;
}

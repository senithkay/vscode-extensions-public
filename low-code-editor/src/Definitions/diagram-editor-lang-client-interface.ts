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

import {
	DocumentSymbol,
	DocumentSymbolParams,
	SymbolInformation,
} from "monaco-languageclient";

import { BaseLangClientInterface } from "./base-lang-client-interface";
import {
	BallerinaConnectorRequest,
	BallerinaConnectorResponse,
	BallerinaConnectorsResponse,
	BallerinaRecordRequest,
	BallerinaRecordResponse,
	BallerinaSTModifyRequest,
	BallerinaSTModifyResponse,
	BallerinaSyntaxTreeModifyRequest,
	BallerinaSyntaxTreeResponse,
	TriggerModifyRequest,
} from "./lang-client-extended";

export interface BallerinaAST {
	id: string;
	kind: string;
	topLevelNodes: BallerinaASTNode[];
}

export interface BallerinaASTNode {
	kind: string;
}

export interface GetSyntaxTreeParams {
	documentIdentifier: {
		uri: string;
	};
}

export interface GetSyntaxTreeResponse {
	syntaxTree: any;
	parseSuccess: boolean;
}

export interface DiagramEditorLangClientInterface extends BaseLangClientInterface {
	registerPublishDiagnostics: () => void;
	syntaxTreeModify: (
		params: BallerinaSyntaxTreeModifyRequest
	) => Thenable<BallerinaSyntaxTreeResponse>;
	getConnectors: () => Thenable<BallerinaConnectorsResponse>;
	getConnector: (
		params: BallerinaConnectorRequest
	) => Thenable<BallerinaConnectorResponse>;
	getRecord: (
		params: BallerinaRecordRequest
	) => Thenable<BallerinaRecordResponse>;
	astModify: (
		params: BallerinaSTModifyRequest
	) => Thenable<BallerinaSTModifyResponse>;
	stModify: (
		params: BallerinaSTModifyRequest
	) => Thenable<BallerinaSTModifyResponse>;
	triggerModify: (
		params: TriggerModifyRequest
	) => Thenable<BallerinaSTModifyResponse>;
	getSyntaxTree: (
		params: GetSyntaxTreeParams
	) => Thenable<GetSyntaxTreeResponse>;
	getDocumentSymbol: (
		params: DocumentSymbolParams
	) => Thenable<DocumentSymbol[] | SymbolInformation[] | null>;
}

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

import { InitializeParams } from "monaco-languageclient";

export const defaultInitParams: InitializeParams = {
	capabilities: {
	},
	processId: process.pid,
	rootUri: null,
	workspaceFolders: null,
};

export const initParams: InitializeParams = {
	processId: process.pid,
	"trace": "off",
	"workspaceFolders": null,
	"rootPath": null,
	"rootUri": null,
	"capabilities": {
		"textDocument": {
			"publishDiagnostics": {
				"relatedInformation": true,
			},
			"completion": {
				"dynamicRegistration": true,
				"contextSupport": true,
				"completionItem": {
					"snippetSupport": true,
					"commitCharactersSupport": true,
					"documentationFormat": [
						"markdown",
						"plaintext"
					],
					"deprecatedSupport": true,
					"preselectSupport": true
				},
				"completionItemKind": {
					"valueSet": [
						1,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						12,
						13,
						14,
						15,
						16,
						17,
						18,
						19,
						20,
						21,
						22,
						23,
						24,
						25
					]
				}
			},
			"documentSymbol": {
				"dynamicRegistration": true,
				"symbolKind": {
					"valueSet": [
						1,
						2,
						3,
						4,
						5,
						6,
						7,
						8,
						9,
						10,
						11,
						12,
						13,
						14,
						15,
						16,
						17,
						18,
						19,
						20,
						21,
						22,
						23,
						24,
						25,
						26
					]
				},
				"hierarchicalDocumentSymbolSupport": true
			},
		}
	},
};

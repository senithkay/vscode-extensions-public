/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import { ExtendedLanguageClient } from './ExtendedLanguageClient';

export class FormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
    constructor(private langClient: ExtendedLanguageClient) { }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Thenable<vscode.TextEdit[]> {
        return this.langClient.rangeFormat({
            textDocument: this.langClient.code2ProtocolConverter
                .asTextDocumentIdentifier(document), range: range, options: options, workDoneToken: token
        }).then(textEdits => { return textEdits });
    }
}

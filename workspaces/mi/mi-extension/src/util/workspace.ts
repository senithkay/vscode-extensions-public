/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Position, Range, Uri, WorkspaceEdit, commands, workspace } from "vscode";
import * as fs from "fs";
import { openView } from "../stateMachine";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { COMMANDS } from "../constants";

export async function replaceFullContentToFile(documentUri: string, content: string, skipOpenView: boolean = false) {
    // Create the file if not present
    let isNewFile = false;
    if (!fs.existsSync(documentUri)) {
        fs.writeFileSync(documentUri, "");
        isNewFile = true;
    }
    const edit = new WorkspaceEdit();
    let document = workspace.textDocuments.find(doc => doc.uri.fsPath === documentUri);
    if (!document) {
        document = await workspace.openTextDocument(Uri.file(documentUri));
    }
    const fullRange = new Range(new Position(0, 0),
        new Position(document.lineCount, 0));

    edit.replace(Uri.file(documentUri), fullRange, content);
    await workspace.applyEdit(edit);
    if (isNewFile && !skipOpenView) {
        openView(EVENT_TYPE.OPEN_VIEW, { view: MACHINE_VIEW.Overview, documentUri });
        commands.executeCommand(COMMANDS.REFRESH_COMMAND);
    }
}

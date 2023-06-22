/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CommandResponse } from "./resources";
import child_process from 'child_process';

export enum PALETTE_COMMANDS {
    SHOW_ARCHITECTURE_VIEW = 'ballerina.view.architectureView',
    REFRESH_SHOW_ARCHITECTURE_VIEW = "ballerina.view.architectureView.refresh",
    OPEN_IN_DIAGRAM = 'ballerina.openIn.diagram'
}

export async function runBackgroundTerminalCommand(command: string) {
    return new Promise<CommandResponse>(function (resolve) {
        child_process.exec(`${command}`, async (err, stdout, stderr) => {
            if (err) {
                resolve({
                    error: true,
                    message: stderr
                });
            } else {
                resolve({
                    error: false,
                    message: stdout
                });
            }
        });
    });
}

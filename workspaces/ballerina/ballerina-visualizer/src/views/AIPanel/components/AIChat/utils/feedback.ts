/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DiagnosticEntry, FeedbackDiagnostic, FeedbackMessage } from "@wso2-enterprise/ballerina-core";
import { Input, parseBadgeString } from "../../AIChatInput/utils/inputUtils";

export function getDiagnosticsForFeedback(entries: DiagnosticEntry[]): FeedbackDiagnostic[] {
    return entries.map(entry => ({
        code: entry.code || "",
        message: entry.message,
    }));
}

export function getConvoHistoryForFeedback(messages: Array<{ role: string; content: string; type: string }> ,index:number, isPositive: boolean):FeedbackMessage[] {
    if (isPositive) {
        return []
    }
    const parsedInputs = messages.slice(0, index + 1).map(msg => {
        // console.log("Parsing message content:", msg.content);
        const inputs: Input[] = parseBadgeString(msg.content);
        const role = msg.role === "User" ? "USER" : msg.role === "Copilot" ? "ASSISTANT" : msg.role.toUpperCase();
        let content;
        let command;

        // Parsing TextInput and BadgeInput sub types.
        for (const input of inputs) {
            if ('content' in input) {
                content = input.content;
                continue;
            }

            if ('command' in input) {
                command = input.command.slice(1);
                continue;
            }
        }

        let parsedMsg;
        if (role === "USER") {
            parsedMsg = {
                "role": role,
                "content": content,
                "command": command || "code",
            };
        } else {
            parsedMsg = {
                "role": role,
                "content": content,
            };
        }

        return parsedMsg;                
    });

    return parsedInputs;
}

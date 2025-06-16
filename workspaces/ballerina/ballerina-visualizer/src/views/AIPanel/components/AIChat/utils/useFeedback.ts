/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useCallback, useState } from 'react';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { DiagnosticEntry } from "@wso2-enterprise/ballerina-core";
import { getConvoHistoryForFeedback } from "../utils/feedback";

interface UseFeedbackOptions {
    messages: Array<{ role: string; content: string; type: string }>;
    currentDiagnosticsRef: React.MutableRefObject<DiagnosticEntry[]>;
}

export const useFeedback = ({ messages, currentDiagnosticsRef }: UseFeedbackOptions) => {
    const { rpcClient } = useRpcContext();
    const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);

    const handleFeedback = useCallback(async (index: number, isPositive: boolean, detailedFeedback?: string) => {
        // Store feedback in local state
        setFeedbackGiven(isPositive ? 'positive' : 'negative');

        try {
            // Parse all messages up to the current index to extract input badges
            const parsedInputs = getConvoHistoryForFeedback(messages, index, isPositive);
            await rpcClient.getAiPanelRpcClient().submitFeedback({
                positive: isPositive,
                messages: parsedInputs,
                feedbackText: detailedFeedback,
                diagnostics: currentDiagnosticsRef.current
            });
        } catch (error) {
            console.error("Failed to send feedback:", error);
        }
    }, [messages, currentDiagnosticsRef, rpcClient]);

    return {
        feedbackGiven,
        setFeedbackGiven,
        handleFeedback
    };
};

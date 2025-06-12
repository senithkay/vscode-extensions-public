/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import FeedbackDialog from "../FeedbackDialog";

interface FeedbackBarProps {
    messageIndex: number;
    onFeedback: (messageIndex: number, isPositive: boolean, detailedFeedback?: string) => void;
    currentFeedback: "positive" | "negative" | null;
}

const FeedbackContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: 1px solid var(--vscode-input-border, #cccccc);
    border-radius: 6px;
    background: var(--vscode-editor-background, #fff);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const FeedbackText = styled.span`
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
`;

const FeedbackButton = styled.button<{ $active?: boolean }>`
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px 4px;
    margin: 0 4px;
    border-radius: 4px;
    color: var(--vscode-foreground);
    background-color: transparent;

    ${(props: { $active: any }) =>
        props.$active &&
        `
        border: 1px solid var(--vscode-button-background);
        padding: 3px 3px; /* Adjust padding to compensate for border */
    `}
    &:hover {
        background-color: transparent;
    }

    &:hover .codicon {
        color: var(--vscode-button-hoverBackground);
    }
    &:focus {
        outline: 1px solid var(--vscode-focusBorder);
    }

    .codicon {
        ${(props: { $active: any }) =>
            props.$active &&
            `
            color: var(--vscode-button-background);
        `}
    }
`;

const CenteredBlock = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 8px 0 0 0;
`;

const FeedbackBar: React.FC<FeedbackBarProps> = ({ messageIndex, onFeedback, currentFeedback }) => {
    const [showDialog, setShowDialog] = useState(false);
    const [dialogFeedbackType, setDialogFeedbackType] = useState<"positive" | "negative">("positive");
    const [showThanks, setShowThanks] = useState(false);

    const handleFeedbackButtonClick = (isPositive: boolean) => {
        setDialogFeedbackType(isPositive ? "positive" : "negative");
        setShowDialog(true);
    };

    const handleDialogCancel = () => {
        setShowDialog(false);
    };

    const handleDialogSubmit = (detailedFeedback: string) => {
        onFeedback(messageIndex, dialogFeedbackType === "positive", detailedFeedback);
        setShowDialog(false);
        setShowThanks(true);
    };

    if (showThanks) {
        return (
            <CenteredBlock>
                <FeedbackContainer>
                    <FeedbackText>Thank you for your feedback!</FeedbackText>
                </FeedbackContainer>
            </CenteredBlock>
        );
    }

    return (
        <CenteredBlock>
            <FeedbackContainer>
                <FeedbackText>Was this response helpful?</FeedbackText>
                <FeedbackButton
                    onClick={() => handleFeedbackButtonClick(true)}
                    $active={currentFeedback === "positive"}
                    title="Thumbs up"
                >
                    <Codicon name="thumbsup" />
                </FeedbackButton>
                <FeedbackButton
                    onClick={() => handleFeedbackButtonClick(false)}
                    $active={currentFeedback === "negative"}
                    title="Thumbs down"
                >
                    <Codicon name="thumbsdown" />
                </FeedbackButton>
            </FeedbackContainer>
            {showDialog && (
                <FeedbackDialog
                    isPositive={dialogFeedbackType === "positive"}
                    messageIndex={messageIndex}
                    onCancel={handleDialogCancel}
                    onSubmit={handleDialogSubmit}
                />
            )}
        </CenteredBlock>
    );
};

export default FeedbackBar;

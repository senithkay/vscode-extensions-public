/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { EntryContainerProps } from "./types";

// Styles for the AI Panel
export const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    width: 100vw;
`;

export const ProgressRing = styled(VSCodeProgressRing)`
    height: 40px;
    width: 40px;
    margin-top: auto;
    padding: 4px;
`;

export const FadeInContainer = styled.div`
    opacity: 0;
    transition: opacity 0.5s ease-in;

    &.visible {
        opacity: 1;
    }
`;

// Styles for the AI Chat
export const Footer = styled.footer({
    padding: "5px",
    backgroundColor: "var(--vscode-editor-background)",
});

export const FlexRow = styled.div({
    display: "flex",
    flexDirection: "row",
});

export const FlexColumn = styled.div({
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    margin: "10px",
    boxShadow: "0 -2px 5px rgba(218, 216, 216, 0.1)",
    borderRadius: "8px",
});

export const Question = styled.div({
    marginBottom: "5px",
    padding: "10px",
    border: "0px solid",
    borderColor: "none",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
});

export const AIChatView = styled.div({
    display: "flex",
    flexDirection: "column",
    height: "100%",
});

export const Header = styled.header({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "10px",
    gap: "10px",
});

export const HeaderButtons = styled.div({
    display: "flex",
    justifyContent: "flex-end",
    marginRight: "10px",
});

export const Main = styled.main({
    flex: 1,
    flexDirection: "column",
    overflowY: "auto",
});

export const RoleContainer = styled.div({
    display: "flex",
    flexDirection: "row",
    gap: "6px",
});

export const ChatMessage = styled.div({
    padding: "20px",
    borderTop: "1px solid var(--vscode-editorWidget-border)",
    position: "relative",
    "&:hover .edit-delete-buttons": {
        display: "flex",
    },
});

export const EditDeleteButtons = styled.div({
    display: "none",
    position: "absolute",
    bottom: "10px",
    right: "10px",
    gap: "5px",
});

export const Welcome = styled.div({
    padding: "0 20px",
});

export const Badge = styled.div`
    padding: 5px;
    margin-left: 10px;
    display: inline-block;
    text-align: left;
`;

export const PreviewContainer = styled.div`
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    font-size: 0.8em;
    padding: 2px 5px;
    border-radius: 3px;
    display: inline-block;
    margin-left: 2px;
`;

export const PreviewContainerRole = styled.div`
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    font-size: 0.8em;
    margin-left: 2px;
    padding: 2px 5px;
    border-radius: 3px;
    display: inline-block;
`;

export const StyledContrastButton = styled(VSCodeButton)`
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    font-size: 0.8em;
    padding: 2px 5px;
    border-radius: 3px;
    &:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
`;

export const StyledTransParentButton = styled.button`
    appearance: "secondary";
    font-size: 0.9em;
    padding: 5px;
    border-radius: 3px;
    width: 80px;
    background-color: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: var(--vscode-editorWidget-border);
    }
`;

export const ResetsInBadge = styled.div`
    font-size: 10px;
`;

export const EntryContainer = styled.div<EntryContainerProps>(({ isOpen }: { isOpen: boolean }) => ({
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
    cursor: "pointer",
    padding: "10px",
    backgroundColor: isOpen ? "var(--vscode-list-hoverBackground)" : "var(--vscode-editorHoverWidget-background)",
    "&:hover": {
        backgroundColor: "var(--vscode-list-hoverBackground)",
    },
}));

export const PreviewContainerDefault = styled.div`
    font-size: 0.6em;
    padding: 2px 5px;
    border-radius: 3px;
    display: inline-block;
    position: relative;
    right: 0;
    top: 10px;
    margin-right: -20px;
`;

export const WelcomeStyles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "100px",
    },
    title: {
        display: "inline-flex",
    },
    description: {
        marginBottom: "24px",
        color: "var(--vscode-descriptionForeground)",
        textAlign: "center",
        maxWidth: 350,
        fontSize: 14,
    },
    command: {
        marginBottom: "14px",
        color: "var(--vscode-descriptionForeground)",
        textAlign: "center",
        maxWidth: 350,
        fontSize: 14,
    },
    attachContext: {
        marginBottom: "24px",
        color: "var(--vscode-descriptionForeground)",
        textAlign: "center",
        maxWidth: 350,
        fontSize: 14,
        gap: 10,
        display: "inline-flex",
    },
};

export const StyledTextArea = styled.textarea`
    overflowY: "hidden",
    padding: "10px",
    borderRadius: "4px",
    border: "none",
    resize: "none",
    outline: "none",
    color: "var(--vscode-input-foreground)",
    position: "relative",                                  
`;

export const RippleLoader = styled.div`
    width: 50px;
    height: 50px;
    display: inline-block;
    overflow: hidden;
    background: transparent;

    .ldio {
        width: 100%;
        height: 100%;
        position: relative;
        transform: translateZ(0) scale(1);
        backface-visibility: hidden;
        transform-origin: 0 0;

        div {
            position: absolute;
            border-width: 1.5px;
            border-style: solid;
            opacity: 1;
            border-radius: 50%;
            animation: ldio-animation 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
            box-sizing: content-box;
        }

        div:nth-child(1) {
            border-color: #0c93e9;
            animation-delay: 0s;
        }

        div:nth-child(2) {
            border-color: #468af0;
            animation-delay: -0.5s;
        }
    }

    @keyframes ldio-animation {
        0% {
            top: 24px; // Adjusted for smaller size
            left: 24px; // Adjusted for smaller size
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 4.5px; // Adjusted for smaller size
            left: 4.5px; // Adjusted for smaller size
            width: 39px; // Adjusted for smaller size
            height: 39px; // Adjusted for smaller size
            opacity: 0;
        }
    }
`;

/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { MarkdownRenderer } from "./MarkdownRenderer";

const CodeBlockContainer = styled.div`
    overflow: hidden;
    margin: 0;
    padding: 6px;
    position: relative;
    background-color: var(--vscode-list-hoverBackground);
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--vscode-list-hoverBackground);
    padding: 8px 16px;
    color: var(--vscode-editor-foreground);
`;

const Title = styled.div`
    font-weight: bold;
`;

const CopyButton = styled.button<{ copied: boolean }>`
    background: ${({ copied }: { copied: boolean }) => (copied ? "var(--vscode-badge-background)" : "transparent")};
    border: none;
    color: var(--vscode-editor-foreground);
    cursor: pointer;
    font-size: 1rem;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.3s ease;
`;

interface BallerinaCodeBlockProps {
    code: string;
}

const BallerinaCodeBlock: React.FC<BallerinaCodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code: ", err);
        }
    };

    return (
        <CodeBlockContainer>
            <Header>
                <Title>Ballerina</Title>
                <CopyButton onClick={handleCopy} copied={copied} title="Copy code">
                    <Codicon name="copy" />
                </CopyButton>
            </Header>
            <MarkdownRenderer markdownContent={`\`\`\`ballerina\n${code}\n\`\`\``} />
        </CodeBlockContainer>
    );
};

export default BallerinaCodeBlock;

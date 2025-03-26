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
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { MarkdownRenderer } from "./MarkdownRenderer";

const CodeBlockContainer = styled.div`
    overflow: hidden;
    margin: 16px 0;
    position: relative;
    background: var(--vscode-toolbar-activeBackground);
    border-radius: 4px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    color: var(--vscode-editor-foreground);
    border-radius: 4px 4px 0 0;
`;

const Title = styled.div`
    font-weight: bold;
`;

const CopyButton = styled.button<{ copied: boolean }>`
    background: transparent;
    border: none;
    color: var(--vscode-editor-foreground);
    cursor: pointer;
    font-size: 0.75rem;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ContentWrapper = styled.div`
    padding: 6px;
    display: flex;
    flex-direction: column;

    pre {
        margin: 0 !important;
    }
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
                <CopyButton onClick={handleCopy} copied={copied} title={copied ? "Copied" : "Copy code"}>
                    <Codicon name={copied ? "check" : "copy"} />
                    {copied ? "Copied" : "Copy"}
                </CopyButton>
            </Header>
            <ContentWrapper>
                <MarkdownRenderer markdownContent={`\`\`\`ballerina\n${code}\n\`\`\``} />
            </ContentWrapper>
        </CodeBlockContainer>
    );
};

export default BallerinaCodeBlock;

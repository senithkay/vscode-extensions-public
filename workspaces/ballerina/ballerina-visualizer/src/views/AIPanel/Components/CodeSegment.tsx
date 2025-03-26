/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */

import styled from "@emotion/styled";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Collapse } from "react-collapse";

const CodeSegmentHeader = styled.div<{ isOpen: boolean }>`
    display: flex;
    align-items: center;
    margin-top: 10px;
    cursor: pointer;
    padding: 8px 8px;
    background-color: var(--vscode-toolbar-activeBackground);
    border-radius: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? "4px 4px 0 0" : "4px")};
`;

export interface CodeSegmentProps {
    source: string;
    fileName: string;
    language?: string;
}

export const CodeSegment: React.FC<CodeSegmentProps> = ({ source, fileName, language }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <CodeSegmentHeader isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                <div
                    style={{
                        flex: 9,
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {isOpen ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                    {fileName}
                </div>
            </CodeSegmentHeader>
            <Collapse isOpened={isOpen}>
                <div style={{ backgroundColor: "var(--vscode-toolbar-activeBackground)", padding: "6px" }}>
                    <pre
                        style={{
                            margin: 0,
                        }}
                    >
                        <MarkdownRenderer markdownContent={`\`\`\`${language}\n${source}\n\`\`\``} />
                    </pre>
                </div>
            </Collapse>
        </div>
    );
};

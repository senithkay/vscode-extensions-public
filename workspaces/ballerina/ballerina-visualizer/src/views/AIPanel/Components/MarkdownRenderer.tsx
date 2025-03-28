/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */

import ReactMarkdown from "react-markdown";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { useEffect } from "react";
import hljs from "highlight.js";
import yaml from "highlight.js/lib/languages/yaml";
// @ts-ignore
import ballerina from "../../../languages/ballerina.js";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("ballerina", ballerina);

interface MarkdownRendererProps {
    markdownContent: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
    const { rpcClient } = useRpcContext();

    useEffect(() => {
        const injectHighlightStyle = (themeKind: string) => {
            // Remove existing theme style
            const existingLink = document.getElementById("hljs-theme");
            if (existingLink) {
                existingLink.remove();
            }

            // Add the correct theme stylesheet
            const link = document.createElement("link");
            link.id = "hljs-theme";
            link.rel = "stylesheet";
            link.href =
                themeKind === "light"
                    ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
                    : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
            document.head.appendChild(link);

            // Also add background override if not present
            if (!document.getElementById("hljs-override")) {
                const style = document.createElement("style");
                style.id = "hljs-override";
                style.innerHTML = `.hljs { background: var(--vscode-editor-background) !important; }`;
                document.head.appendChild(style);
            }
        };

        const applyTheme = async () => {
            const themeKind = await rpcClient.getAiPanelRpcClient().getThemeKind(); // "light" or "dark"
            injectHighlightStyle(themeKind);
        };

        // Listen for theme changes via project content update
        rpcClient.onProjectContentUpdated(() => {
            applyTheme();
        });

        applyTheme();
    }, []);

    const MarkdownComponents = {
        code({ inline, className, children }: { inline?: boolean; className?: string; children: React.ReactNode }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = ((Array.isArray(children) ? children.join("") : children) ?? "").toString();

            if (!inline && match) {
                const language = match[1];

                // Check if the language is registered
                if (hljs.getLanguage(language)) {
                    return (
                        <pre>
                            <code
                                className={`hljs ${language}`}
                                dangerouslySetInnerHTML={{
                                    __html: hljs.highlight(codeString, { language: language }).value,
                                }}
                            />
                        </pre>
                    );
                } else {
                    // Fallback: treat as plain text
                    return (
                        <pre>
                            <code className="hljs">{codeString}</code>
                        </pre>
                    );
                }
            }
            return <code className={className}>{children}</code>;
        },
    };

    return <ReactMarkdown components={MarkdownComponents}>{markdownContent}</ReactMarkdown>;
};

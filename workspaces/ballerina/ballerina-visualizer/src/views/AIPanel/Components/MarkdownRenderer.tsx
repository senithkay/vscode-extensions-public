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

import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import hljs from "highlight.js";
import yaml from "highlight.js/lib/languages/yaml";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import Badge from "./Badge";
// @ts-ignore - Custom language definition for Ballerina
import ballerina from "../../../languages/ballerina.js";

// Register custom languages with highlight.js
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("ballerina", ballerina);

// Escapes all HTML tags except the custom <badge> tag
const escapeHtmlExceptBadge = (markdown: string): string => {
    return markdown.replace(/<\/?(?!badge\b)(\w+)[^>]*>/g, (match) =>
        match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    );
};

interface MarkdownRendererProps {
    markdownContent: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
    const { rpcClient } = useRpcContext();

    useEffect(() => {
        /**
         * Injects the appropriate highlight.js theme stylesheet based on the current theme.
         */
        const injectHighlightTheme = (theme: string) => {
            const existingTheme = document.getElementById("hljs-theme");
            if (existingTheme) existingTheme.remove();

            const themeLink = document.createElement("link");
            themeLink.id = "hljs-theme";
            themeLink.rel = "stylesheet";
            themeLink.href =
                theme === "light"
                    ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
                    : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";
            document.head.appendChild(themeLink);

            // Add background override once
            if (!document.getElementById("hljs-override")) {
                const overrideStyle = document.createElement("style");
                overrideStyle.id = "hljs-override";
                overrideStyle.innerHTML = `.hljs { background: var(--vscode-editor-background) !important; }`;
                document.head.appendChild(overrideStyle);
            }
        };

        /**
         * Applies theme on initial load and theme changes.
         */
        const applyCurrentTheme = async () => {
            const themeKind = await rpcClient.getAiPanelRpcClient().getThemeKind(); // Returns "light" or "dark"
            injectHighlightTheme(themeKind);
        };

        rpcClient.onProjectContentUpdated(() => {
            applyCurrentTheme();
        });

        applyCurrentTheme();
    }, [rpcClient]);

    /**
     * Custom rendering for <code> blocks with syntax highlighting
     */
    const MarkdownCodeRenderer = {
        code({ inline, className, children }: { inline?: boolean; className?: string; children: React.ReactNode }) {
            const codeContent = (Array.isArray(children) ? children.join("") : children) ?? "";
            const match = /language-(\w+)/.exec(className || "");

            if (!inline && match) {
                const language = match[1];

                // Apply syntax highlighting if language is registered
                if (hljs.getLanguage(language)) {
                    return (
                        <pre>
                            <code
                                className={`hljs ${language}`}
                                dangerouslySetInnerHTML={{
                                    __html: hljs.highlight(codeContent.toString(), { language }).value,
                                }}
                            />
                        </pre>
                    );
                }

                // Fallback: render as plain text
                return (
                    <pre>
                        <code className="hljs">{codeContent}</code>
                    </pre>
                );
            }

            return <code className={className}>{children}</code>;
        },
    };

    // Custom components for markdown elements
    const CustomMarkdownComponents = {
        badge: Badge,
    };

    // Escape HTML except <badge> tags
    const safeContent = escapeHtmlExceptBadge(markdownContent);

    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
                ...MarkdownCodeRenderer,
                ...CustomMarkdownComponents,
            }}
        >
            {safeContent}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;

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
        const fetchTheme = async () => {
            const themeKind = await rpcClient.getAiPanelRpcClient().getThemeKind();
            if (themeKind === "light") {
                // @ts-ignore
                import("highlight.js/styles/github.css").then(() => {
                    // Apply custom override
                    const styleElement = document.createElement("style");
                    styleElement.innerHTML = `.hljs { background: var(--vscode-editor-background) !important; }`;
                    document.head.appendChild(styleElement);
                });
            } else {
                // @ts-ignore
                import("highlight.js/styles/github-dark.css").then(() => {
                    // Apply custom override
                    const styleElement = document.createElement("style");
                    styleElement.innerHTML = `.hljs { background: var(--vscode-editor-background) !important; }`;
                    document.head.appendChild(styleElement);
                });
            }
        };
        fetchTheme();
    }, []);

    const MarkdownComponents: object = {
        code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <pre>
                    <code
                        className={`hljs ${match[1]}`}
                        dangerouslySetInnerHTML={{
                            __html: hljs.highlight(children.toString(), { language: match[1] }).value,
                        }}
                    />
                </pre>
            ) : (
                <code className={className}>{children}</code>
            );
        },
    };

    return <ReactMarkdown components={MarkdownComponents}>{markdownContent}</ReactMarkdown>;
};

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
        code({
            inline,
            className,
            children,
        }: {
            inline?: boolean;
            className?: string;
            children: React.ReactNode;
        }) {
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

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
import { useEffect, useState } from "react";
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
                    console.log("Loaded Light Theme");
                });
            } else {
                // @ts-ignore
                import("highlight.js/styles/github-dark.css").then(() => {
                    console.log("Loaded Dark Theme");
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


// import ReactMarkdown from "react-markdown";
// import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
// import yaml from "react-syntax-highlighter/dist/cjs/languages/prism/yaml";
// import go from "react-syntax-highlighter/dist/cjs/languages/prism/go";
// import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
// import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
// import { useEffect, useState } from "react";

// SyntaxHighlighter.registerLanguage("json", json);
// SyntaxHighlighter.registerLanguage("yaml", yaml);
// SyntaxHighlighter.registerLanguage("go", go);

// interface MarkdownRendererProps {
//     markdownContent: string;
// }

// export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
//     const { rpcClient } = useRpcContext();
//     const [syntaxTheme, setSyntaxTheme] = useState<any>(null);

//     useEffect(() => {
//         const fetchTheme = async () => {
//             const theme = await rpcClient.getAiPanelRpcClient().getThemeKind();
//             setSyntaxTheme(theme === "light" ? oneLight : oneDark);
//         };
//         fetchTheme();
//     }, []);

//     const MarkdownComponents: object = {
//         code({ node, inline, className, ...props }) {
//             const hasLang = /language-(\w+)/.exec(className || "");
//             const hasMeta = node?.data?.meta;

//             return hasLang ? (
//                 syntaxTheme ? (
//                     <SyntaxHighlighter
//                         style={syntaxTheme}
//                         language={hasLang[1]}
//                         PreTag="div"
//                         className="codeStyle"
//                         showLineNumbers={false}
//                         wrapLines={hasMeta}
//                         useInlineStyles={true}
//                     >
//                         {props.children}
//                     </SyntaxHighlighter>
//                 ) : (
//                     <div>Loading theme...</div> // Show loading text while fetching theme
//                 )
//             ) : (
//                 <code className={className} {...props} />
//             );
//         },
//     };

//     return <ReactMarkdown components={MarkdownComponents}>{markdownContent}</ReactMarkdown>;
// };

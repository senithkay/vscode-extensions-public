import ReactMarkdown from "react-markdown";

import styled from "@emotion/styled";

interface MarkdownRendererProps {
    markdownContent: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
    return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

export const Footer = styled.footer({
    padding: "20px",
});

export const FlexRow = styled.div({
    display: "flex",
    flexDirection: "row",
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

export const ChatMessage = styled.div({
    padding: "20px",
    borderTop: "1px solid var(--vscode-editorWidget-border)",
});

export const Welcome = styled.div({
    padding: "0 20px",
});

export const Badge = styled.div`
    // padding: 5px;
    // margin-left: 10px;
    display: inline-block;
    text-align: left;
`;

export const ResetsInBadge = styled.div`
    font-size: 10px;
`;

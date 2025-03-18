// /**
//  * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
//  *
//  * This software is the property of WSO2 LLC. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
//  * You may not alter or remove any copyright or other notice from copies of this content.
//  *
//  * THIS FILE INCLUDES AUTO GENERATED CODE
//  */

import styled from "@emotion/styled";

interface BadgeProps {
    text: string;
}

const BadgeContainer = styled.div`
    background-color: var(--vscode-editorWidget-background);
    color: var(--vscode-editorWidget-foreground);
    padding: 4px;
    border-radius: 4px;
    display: inline-block;
    align-items: center;
    line-height: 1;
    font-family: "Source Code Pro", monospace;
    margin-right: 2px;
    user-select: text;
    white-space: nowrap;
`;

const TextContainer = styled.div`
    display: flex;
    flex-wrap: wrap; /* Allows content to wrap within the parent */
    align-items: center;
    word-break: break-word;
    padding: 16px 0;
`;

const Badge: React.FC<BadgeProps> = ({ text }) => {
    return <BadgeContainer contentEditable={false}>{text}</BadgeContainer>;
};

interface TextWithBadgesProps {
    text: string;
}

const TextWithBadges: React.FC<TextWithBadgesProps> = ({ text }) => {
    // Regex to match <badge>...</badge>
    const badgeRegex = /<badge>(.*?)<\/badge>/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = badgeRegex.exec(text)) !== null) {
        let beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
            beforeText = beforeText.replace(/ /g, "\u00A0");
            parts.push(<span key={lastIndex}>{beforeText}</span>);
        }

        parts.push(<Badge key={match.index} text={match[1]} />);
        lastIndex = match.index + match[0].length;
    }

    // Push remaining text if any
    if (lastIndex < text.length) {
        let remainingText = text.substring(lastIndex).replace(/ /g, "\u00A0");
        parts.push(<span key={lastIndex}>{remainingText}</span>);
    }

    return <TextContainer>{parts}</TextContainer>;
};

export default TextWithBadges;

/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Meta, StoryObj } from "@storybook/react-vite";
import { SyntaxHighlighter } from "./SyntaxHighlighter";

const xmlCode = `<note>
<to city="Colombo">User</to>
<from>WSO2</from>
<heading>Reminder</heading>
<body>Don't forget to subscribe!</body>
</note>`;

const jsonCode = '{"name":"John", "age":30, "car":null}';
const javaScriptCode = `function add(a, b) {
    // This is a comment
    return a + b;
}`;
const cssCode = `body {
    background-color: lightblue;
}`;
const htmlCode = `<!DOCTYPE html>
<html>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>`;

const meta: Meta<typeof SyntaxHighlighter> = {
    component: SyntaxHighlighter,
    title: "Syntax Highlighter",
};
export default meta;

type Story = StoryObj<typeof SyntaxHighlighter>;

export const SampleXML: Story = {
    args: { code: xmlCode, language: "xml" },
};

export const SampleJSON: Story = {
    args: { code: jsonCode, language: "json" },
};

export const SampleJS: Story = {
    args: { code: javaScriptCode, language: "javascript" },
};

export const SampleCSS: Story = {
    args: { code: cssCode, language: "css" },
};

export const SampleHTML: Story = {
    args: { code: htmlCode, language: "html" },
};

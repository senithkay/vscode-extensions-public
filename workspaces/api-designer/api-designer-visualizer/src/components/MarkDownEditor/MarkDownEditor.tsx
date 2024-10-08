/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    codeBlockPlugin, CodeToggle,
    CreateLink, diffSourcePlugin,
    DiffSourceToggleWrapper,
    headingsPlugin,
    InsertTable,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    ListsToggle,
    MDXEditor,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo
} from '@mdxeditor/editor';

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-end;
    flex-grow: 1;
`;

interface MakrDownEditorProps {
    value: string;
    onChange: (value: string) => void;
}

function Separator() {
    return (
      <div
        data-orientation="vertical"
        aria-orientation="vertical"
        role="separator"
      ></div>
    );
}

const StyledMDXEditor = styled(MDXEditor)`
    --baseBg: var(--vscode-list-deemphasizedForeground);
    color: var(--vscode-editor-foreground);
    --basePageBg: var(--vscode-editorRuler-foreground);
    --baseBorderHover: var(--vscode-editor-inactiveSelectionBackground);
    --baseTextContrast: var(--vscode-editorWidget-foreground);
    --baseBgActive: var(--vscode-breadcrumbPicker-background);
    --radius-medium: 0;
    --baseBorder: var(--vscode-list-hoverBackground);
    --baseBase: var(--vscode-list-hoverBackground);
    background-color: var(--vscode-list-hoverBackground);
`;
const ToolbarUR = styled(UndoRedo)`
    display: flex;
`;

export function MarkDownEditor(props: MakrDownEditorProps) {
    const { value, onChange } = props;

    return (
        <StyledMDXEditor
            markdown={value}
            onChange={(markdown) => console.log(markdown)}
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                linkPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                codeBlockPlugin(),
                tablePlugin(),
                quotePlugin(),
                diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
                linkDialogPlugin({}),
                tablePlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                            <ToolbarUR />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <CreateLink />
                            <InsertTable />
                        </DiffSourceToggleWrapper>
                    )
                })
            ]}
        />
    );
}

/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import {
    VSCodeButton,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { Overlay } from "../Commons/Overlay";
import { Codicon } from "../Codicon/Codicon";

export interface ContextMenuProps {
    loading?: boolean;
    menuId?: string;
    children?: React.ReactNode;
}

const ExpandedMenu = styled.div<ContextMenuProps>`
    position: absolute;
    margin-top: 30px;
    z-index: 15;
    background: var(--vscode-editor-background);
    box-shadow: var(--vscode-widget-shadow) 0px 4px 10px;
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 3px);
    width: calc(var(--design-unit) * 3px);
    margin-top: auto;
    padding: 4px;
`;

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ContextMenu: React.FC<ContextMenuProps> = (props: ContextMenuProps) => {
    const { loading, menuId, children } = props;
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsOpen(true);
    };

    const handleClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsOpen(false);
    };

    return (
        <Container>
            {loading ? (
                <SmallProgressRing />
            ) : (
                <VSCodeButton appearance="icon" onClick={handleClick} title="More Actions" id={`component-list-menu-${menuId ? menuId : "btn"}`}>
                    <Codicon name="ellipsis" />
                </VSCodeButton>
            )}

            {isOpen && (
                <ExpandedMenu>
                    {children}
                </ExpandedMenu>
            )}
            {isOpen && <Overlay onClose={handleClose} />}
        </Container>
    );
};

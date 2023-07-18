/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import React, { useState } from 'react';
import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell, VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { Codicon } from "../Codicon/Codicon";
import styled from '@emotion/styled';

const VSCodeDataGridInlineCell = styled(VSCodeDataGridCell)`
    text-align: left;
    width: 220px;
    display: flex;
    align-items: center;
`;

const ContextOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
`;

const ExpandedMenu = styled.div`
    position: absolute;
    right: 0;
    top: 24px;
    z-index: 15;
    background: var(--vscode-editor-background);
    box-shadow: var(--vscode-widget-shadow) 0px 0px 8px;
`;

export interface MenuItem {
    id: number | string;
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

interface Props {
    items: MenuItem[];
}

export const ContextMenu: React.FC<Props> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleItemClick = (item: MenuItem) => {
        item.onClick();
        setIsOpen(false);
    };

    return (
        <>
            <VSCodeButton
                appearance="icon"
                onClick={handleClick}
                title="More Actions"
                id="component-list-menu-btn"
            >
                <Codicon name="ellipsis" />
            </VSCodeButton>
            {isOpen && (
                <ExpandedMenu>
                    <VSCodeDataGrid aria-label="Context Menu">
                        {items.map((item) => (
                            <VSCodeDataGridRow
                                key={item.id}
                                onClick={item.disabled ? undefined : () => handleItemClick(item)}
                                style={{
                                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                                    opacity: item.disabled ? 0.5 : 1,
                                }}
                                id={`component-list-menu-${item.id}`}
                            >
                                <VSCodeDataGridInlineCell>
                                    {item.label}
                                </VSCodeDataGridInlineCell>
                            </VSCodeDataGridRow>
                        ))}
                    </VSCodeDataGrid>
                </ExpandedMenu>
            )}
            {isOpen && <ContextOverlay onClick={handleClose} />}
        </>
    );
};


/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { Button, Icon, SidePanelBody } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { LogIcon } from "../../resources";
import { Colors } from "../../resources/constants";
import { Category, Node } from "./../NodeList/types";

namespace S {
    export const GroupRow = styled.div<{ showBorder?: boolean }>`
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        width: 100%;
        margin-top: 8px;
        margin-bottom: ${({ showBorder }) => (showBorder ? "20px" : "12px")};
        padding-bottom: 8px;
        border-bottom: ${({ showBorder }) => (showBorder ? `1px solid ${Colors.OUTLINE_VARIANT}` : "none")};
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
        gap: 8px;
        margin-top: 4px;
        margin-bottom: 4px;
        width: 100%;
    `;

    export const SubTitle = styled.div<{}>`
        font-size: 12px;
        opacity: 0.9;
    `;

    export const Component = styled.div<{ enabled?: boolean }>`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        padding: 5px;
        border: 1px solid ${Colors.OUTLINE_VARIANT};
        border-radius: 5px;
        height: 36px;
        cursor: ${({ enabled }) => (enabled ? "pointer" : "not-allowed")};
        font-size: 14px;
        ${({ enabled }) => !enabled && "opacity: 0.5;"}
        &:hover {
            ${({ enabled }) =>
                enabled &&
                `
                background-color: ${Colors.PRIMARY_CONTAINER};
                border: 1px solid ${Colors.PRIMARY};
            `}
        }
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & svg {
            height: 16px;
            width: 16px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;
}

interface GroupListProps {
    category: Category;
    onSelect: (id: string, metadata?: any) => void;
}

export function GroupList(props: GroupListProps) {
    const { category, onSelect } = props;

    const [showList, setShowList] = useState(false);

    const nodes = category.items as Node[];

    const handleAddNode = (node: Node) => {
        onSelect(node.id, node.metadata);
    };

    return (
        <S.GroupRow>
            <S.Row>
                <S.SubTitle>{category.title}</S.SubTitle>
                <Button onClick={() => setShowList(!showList)}>
                    <Icon sx={{ marginTop: 2, marginRight: 5 }} name={showList ? "chevron-up" : "chevron-down"} />
                </Button>
            </S.Row>
            {showList &&
                nodes.map((node, index) => (
                    <S.Component key={node.id + index} enabled={node.enabled} onClick={() => handleAddNode(node)}>
                        <S.IconContainer>{node.icon || <LogIcon />}</S.IconContainer>
                        <div>{node.label}</div>
                    </S.Component>
                ))}
        </S.GroupRow>
    );
}

export default GroupList;

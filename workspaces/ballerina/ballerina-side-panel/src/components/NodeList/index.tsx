/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { SearchBox, SidePanelBody, Switch, Tooltip } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { LogIcon } from "../../resources";
import { Colors } from "../../resources/constants";
import { Category, Node } from "./types";
import { cloneDeep, debounce } from "lodash";

namespace S {
    export const Container = styled.div<{}>`
        width: 100%;
    `;

    export const HeaderContainer = styled.div<{}>`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
    `;

    export const PanelBody = styled(SidePanelBody)`
        height: calc(100vh - 150px);
        padding-top: 0;
    `;

    export const StyledSearchInput = styled(SearchBox)`
        height: 30px;
    `;

    export const CategoryRow = styled.div<{ showBorder?: boolean }>`
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

    export const Grid = styled.div<{}>`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
        margin-top: 8px;
    `;

    export const Title = styled.div<{}>`
        font-size: 14px;
        font-family: GilmerBold;
        text-wrap: nowrap;
        &:first {
            margin-top: 0;
        }
    `;

    export const SubTitle = styled.div<{}>`
        font-size: 12px;
        opacity: 0.9;
    `;

    export const BodyText = styled.div<{}>`
        font-size: 11px;
        opacity: 0.5;
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

    export const HorizontalLine = styled.hr`
        width: 100%;
        border: 0;
        border-top: 1px solid ${Colors.OUTLINE_VARIANT};
    `;
}

interface NodeListProps {
    categories: Category[];
    onSelect: (id: string, metadata?: any) => void;
    onSearchTextChange?: (text: string) => void;
}

export function NodeList(props: NodeListProps) {
    const { categories, onSelect, onSearchTextChange } = props;

    console.log(">>> categories", { categories });

    const [searchText, setSearchText] = useState<string>("");
    const [showConnectionPanel, setShowConnectionPanel] = useState(false);

    const handleOnSearch = (text: string) => {
        setSearchText(text);
        if (onSearchTextChange) {
            debounce(onSearchTextChange, 300)(text);
        }
    };

    const handleAddNode = (node: Node) => {
        onSelect(node.id, node.metadata);
    };

    const getNodesContainer = (nodes: Node[]) => (
        <S.Grid>
            {nodes.map((node, index) => (
                <Tooltip content={node.description} key={node.id + index + "tooltip"}>
                    <S.Component key={node.id + index} enabled={node.enabled} onClick={() => handleAddNode(node)}>
                        <S.IconContainer>{node.icon || <LogIcon />}</S.IconContainer>
                        <div>{node.label}</div>
                    </S.Component>
                </Tooltip>
            ))}
        </S.Grid>
    );

    const getCategoryContainer = (groups: Category[], isSubCategory = false) => (
        <>
            {groups.map((group, index) => {
                if (!group || group.items.length === 0) {
                    return null;
                }
                return (
                    <S.CategoryRow key={group.title + index} showBorder={!isSubCategory}>
                        <S.Row>
                            {isSubCategory && (
                                <Tooltip content={group.description}>
                                    <S.SubTitle>{group.title}</S.SubTitle>
                                </Tooltip>
                            )}
                            {!isSubCategory && <S.Title>{group.title}</S.Title>}
                        </S.Row>
                        {!isSubCategory && <S.BodyText>{group.description}</S.BodyText>}
                        {group.items.length > 0 && "id" in group.items.at(0)
                            ? getNodesContainer(group.items as Node[])
                            : getCategoryContainer(group.items as Category[], true)}
                    </S.CategoryRow>
                );
            })}
        </>
    );

    // HACK: This is a temporary solution to render node list
    const firstCategory = [cloneDeep(categories.at(0))];
    const lastCategory = [categories.at(2), categories.at(3)];

    return (
        <S.Container>
            <S.HeaderContainer>
                <Switch
                    leftLabel="Nodes"
                    rightLabel="Connections"
                    checked={showConnectionPanel}
                    checkedColor="var(--vscode-button-background)"
                    enableTransition={true}
                    onChange={() => {
                        setShowConnectionPanel(!showConnectionPanel);
                    }}
                    sx={{
                        margin: "auto",
                        zIndex: "2",
                        border: "unset",
                    }}
                    disabled={false}
                />
                <S.Row>
                    <S.StyledSearchInput value={searchText} autoFocus={true} onChange={handleOnSearch} size={60} />
                </S.Row>
            </S.HeaderContainer>
            {!showConnectionPanel && <S.PanelBody>{getCategoryContainer(firstCategory)}</S.PanelBody>}
            {showConnectionPanel && <S.PanelBody>{getCategoryContainer(lastCategory)}</S.PanelBody>}
        </S.Container>
    );
}

export default NodeList;

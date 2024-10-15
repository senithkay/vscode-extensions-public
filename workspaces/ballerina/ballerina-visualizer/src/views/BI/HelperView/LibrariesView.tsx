import { BIGetFunctionsRequest, Category, LineRange, LogIcon, NodePosition } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Category as PanelCategory, GroupList, Node, ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";

import { useEffect, useState } from "react";
import { convertFunctionCategoriesToSidePanelCategories } from "../../../utils/bi";
import { ProgressRing, SearchBox, SidePanelBody, Tooltip } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import React from "react";
import { Colors } from "../../../resources/constants";
import { debounce } from "lodash";

interface LibrariesViewProps {
    filePath: string;
    position: LineRange;
    updateFormField: (data: ExpressionFormField) => void;
    editorKey: string;

}

namespace S {
    export const Container = styled.div<{}>`
        width: 100%;
    `;

    export const HeaderContainer = styled.div<{}>`
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    `;

    export const PanelBody = styled(SidePanelBody)`
        height: calc(100vh - 100px);
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
        margin-bottom: ${({ showBorder }: { showBorder?: boolean }) => (showBorder ? "20px" : "12px")};
        padding-bottom: 8px;
        border-bottom: ${({ showBorder }: { showBorder?: boolean }) => (showBorder ? `1px solid ${Colors.OUTLINE_VARIANT}` : "none")};
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        margin-bottom: 4px;
        width: 100%;
    `;

    export const LeftAlignRow = styled(Row)`
        justify-content: flex-start;
    `;

    export const Grid = styled.div<{ columns: number }>`
        display: grid;
        grid-template-columns: repeat(${({ columns }: { columns: number }) => columns}, 1fr);
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
        cursor: ${({ enabled }: { enabled?: boolean }) => (enabled ? "pointer" : "not-allowed")};
        font-size: 14px;
        ${({ enabled }: { enabled?: boolean }) => !enabled && "opacity: 0.5;"}
        &:hover {
            ${({ enabled }: { enabled?: boolean }) =>
            enabled &&
            `
                background-color: ${Colors.PRIMARY_CONTAINER};
                border: 1px solid ${Colors.PRIMARY};
            `}
        }
    `;

    export const ComponentTitle = styled.div`
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        width: 124px;
        word-break: break-all;
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


    export const HighlightedButton = styled.div`
        margin-top: 10px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding: 6px 2px;
        color: ${Colors.PRIMARY};
        border: 1px dashed ${Colors.PRIMARY};
        border-radius: 5px;
        cursor: pointer;
        &:hover {
            border: 1px solid ${Colors.PRIMARY};
            background-color: ${Colors.PRIMARY_CONTAINER};
        }
    `;

}

export function LibrariesView(props: LibrariesViewProps) {
    const { filePath, position, updateFormField, editorKey } = props;
    const { rpcClient } = useRpcContext();
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setIsSearching(true);
        debouncedSearch(searchText);
        return () => debouncedSearch.cancel();
    }, [searchText]);


    const handleSearchFunction = async (searchText: string) => {
        const request: BIGetFunctionsRequest = {
            position: {
                startLine: position.startLine,
                endLine: position.endLine,
            },
            filePath: filePath,
            queryMap: searchText.trim()
                ? {
                    q: searchText,
                    limit: 12,
                    offset: 0,
                }
                : undefined,
        };
        console.log(">>> Search function request", request);
        setIsSearching(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getFunctions(request)
            .then((response) => {
                console.log(">>> Searched List of functions", response);
                setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
            })
            .finally(() => {
                setIsSearching(false);
            });
    };

    const debouncedSearch = debounce(handleSearchFunction, 1100);

    const handleOnSearch = (text: string) => {
        setSearchText(text);
    };

    useEffect(() => {
        setIsSearching(false);
    }, [categories]);



    useEffect(() => {
        // Fetch libraries
        setIsSearching(true);
        rpcClient
            .getBIDiagramRpcClient()
            .getFunctions({
                position: { startLine: position.startLine, endLine: position.startLine },
                filePath: filePath,
                queryMap: undefined,
            })
            .then((response) => {
                console.log(">>> List of functions", response);
                setCategories(convertFunctionCategoriesToSidePanelCategories(response.categories as Category[]));
            })
            .finally(() => {
                setIsSearching(false);
            });
    }, [filePath, position]);




    function handleAddFunction(node: Node): void {
        console.log("====== Add Function", node);
        // TODO: Pass codedata and get the function signature
        const functionSignature = node?.metadata?.codedata?.module ? `${node.metadata.codedata.module}:${node.metadata.codedata.symbol}` : node?.label;
        const updateData: ExpressionFormField = {
            value: functionSignature + "(",
            key: editorKey
        }
        updateFormField(updateData);
    }


    const getNodesContainer = (nodes: Node[]) => (
        <S.Grid columns={2}>
            {nodes.map((node, index) => {
                return (
                    <S.Component key={node.id + index} enabled={node.enabled} onClick={() => handleAddFunction(node)}>
                        <S.IconContainer>{node.icon || <LogIcon />}</S.IconContainer>
                        <S.ComponentTitle>{node.label}</S.ComponentTitle>
                    </S.Component>
                );
            })}
        </S.Grid>
    );

    const getFunctionContainer = (categories: PanelCategory[]) => (
        <S.Grid columns={1}>
            {categories.map((category, index) => (
                <GroupList
                    key={category.title + index + "tooltip"}
                    category={category}
                    expand={searchText?.length > 0}
                    onSelect={handleAddFunction}
                />
            ))}
        </S.Grid>
    );


    const getCategoryContainer = (groups: PanelCategory[], isSubCategory = false) => {
        const content = (
            <>
                {groups.map((group, index) => {
                    const isProjectFunctionsCategory = group.title === "Project";
                    if ((!group || group?.items?.length === 0) && !isProjectFunctionsCategory) {
                        return null;
                    }
                    if (searchText && group?.items?.length === 0) {
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
                                {!isSubCategory && (
                                    <>
                                        <S.Title>{group.title}</S.Title>
                                    </>
                                )}
                            </S.Row>
                            {group.items.length > 0 && "id" in group.items.at(0)
                                ? getNodesContainer(group.items as Node[])
                                : isProjectFunctionsCategory
                                    ? getFunctionContainer(group.items as PanelCategory[])
                                    : getCategoryContainer(group.items as PanelCategory[], true)}
                        </S.CategoryRow>
                    );
                })}
            </>
        );

        // Check if the content is empty
        const isEmpty = React.Children.toArray(content.props.children).every((child) => child === null);

        return isEmpty ? <div style={{ paddingTop: "10px" }}>No matching results found</div> : content;
    };

    return (
        <div style={{ padding: "8px" }}>
            <S.HeaderContainer>
                <S.Row>
                    <S.StyledSearchInput
                        value={searchText}
                        placeholder="Search"
                        autoFocus={true}
                        onChange={handleOnSearch}
                        size={60}
                    />
                </S.Row>
            </S.HeaderContainer>
            {isSearching && (
                <S.PanelBody>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <ProgressRing />
                    </div>
                </S.PanelBody>
            )}
            {!isSearching && categories.length > 0 && (
                <div>{getCategoryContainer(categories)}</div>
            )}
        </div>

    );
}
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { AvailableNode, Category, Item } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, ProgressRing, SearchBox, Typography } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep, debounce } from "lodash";
import ButtonCard from "../../../../components/ButtonCard";
import { BodyText } from "../../../styles";

const Container = styled.div`
    padding: 0 20px;
    width: 100%;
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
    height: 80vh;
    overflow-y: scroll;
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    width: 100%;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-top: 32px;
    width: 100%;
`;

const StyledSearchInput = styled(SearchBox)`
    height: 30px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
`;

const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

interface ConnectorViewProps {
    onSelectConnector: (connector: AvailableNode) => void;
    fetchingInfo: boolean;
    onClose?: () => void;
}

export function ConnectorView(props: ConnectorViewProps) {
    const { onSelectConnector, onClose, fetchingInfo } = props;
    const { rpcClient } = useRpcContext();

    const [connectors, setConnectors] = useState<Category[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        setIsSearching(true);
        getConnectors();
    }, []);

    const getConnectors = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getBIConnectors({ queryMap: {} })
            .then((model) => {
                console.log(">>> bi connectors", model);
                setConnectors(model.categories);
            }).finally(() => {
                setIsSearching(false);
            });
    };

    useEffect(() => {
        setIsSearching(true);
        debouncedSearch(searchText);
        return () => debouncedSearch.cancel();
    }, [searchText]);

    const handleSearch = (text: string) => {
        rpcClient
            .getBIDiagramRpcClient()
            .getBIConnectors({ queryMap: { q: text } })
            .then((model) => {
                console.log(">>> bi searched connectors", model);
                setConnectors(model.categories);
            }).finally(() => {
                setIsSearching(false);
            });
    }
    const debouncedSearch = debounce(handleSearch, 1100);

    const handleOnSearch = (text: string) => {
        setSearchText(text);
    };

    const filterItems = (items: Item[]): Item[] => {
        return items
            .map((item) => {
                if ("items" in item) {
                    const filteredItems = filterItems(item.items);
                    return {
                        ...item,
                        items: filteredItems,
                    };
                } else {
                    const lowerCaseTitle = item.metadata.label.toLowerCase();
                    const lowerCaseDescription = item.metadata.description?.toLowerCase() || "";
                    const lowerCaseSearchText = searchText.toLowerCase();
                    if (
                        lowerCaseTitle.includes(lowerCaseSearchText) ||
                        lowerCaseDescription.includes(lowerCaseSearchText)
                    ) {
                        return item;
                    }
                }
            })
            .filter(Boolean);
    };

    const filteredCategories = cloneDeep(connectors).map((category) => {
        if (!category || !category.items) {
            return category;
        }
        category.items = filterItems(category.items);
        return category;
    });

    return (
        <Container>
            <TopBar>
                <Typography variant="h2">Select a Connector</Typography>
                {onClose && (
                    <Button appearance="icon" onClick={onClose}>
                        <Codicon name="close" />
                    </Button>
                )}
            </TopBar>

            <BodyText>
                Select a connector to integrate with external services. Use search to quickly find the right one.
            </BodyText>
            <Row>
                <StyledSearchInput
                    value={searchText}
                    placeholder="Search"
                    autoFocus={true}
                    onChange={handleOnSearch}
                    size={60}
                    sx={{ width: "100%" }}
                />
            </Row>
            {(isSearching || fetchingInfo) && (
                <ListContainer>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <ProgressRing />
                    </div>
                </ListContainer>)}
            {filteredCategories && filteredCategories.length > 0 && (
                <ListContainer>
                    {/* Default connectors of LS is hardcoded and is sent with categories with item field */}
                    {filteredCategories[0]?.items ? (
                        filteredCategories.map((category, index) => {
                            return (
                                <div key={category.metadata.label + index}>
                                    <Typography variant="h3">{category.metadata.label}</Typography>
                                    <GridContainer>
                                        {category.items?.map((connector, index) => {
                                            return (
                                                <ButtonCard
                                                    key={connector.metadata.label + index}
                                                    title={capitalizeFirstLetter(connector.metadata.label)}
                                                    description={
                                                        (connector as AvailableNode).codedata.org +
                                                        " / " +
                                                        (connector as AvailableNode).codedata.module
                                                    }
                                                    icon={
                                                        connector.metadata.icon ? (
                                                            <img
                                                                src={connector.metadata.icon}
                                                                alt={connector.metadata.label}
                                                                style={{ width: "24px" }}
                                                            />
                                                        ) : (
                                                            <Codicon name="package" />
                                                        )
                                                    }
                                                    onClick={() => {
                                                        onSelectConnector(connector as AvailableNode);
                                                    }}
                                                />
                                            );
                                        })}
                                    </GridContainer>
                                </div>
                            );
                        })
                    ) : (
                        <GridContainer>
                            {connectors.map((item, index) => {
                                const connector = item as Item;
                                return (
                                    <ButtonCard
                                        key={connector.metadata.label + index}
                                        title={capitalizeFirstLetter(connector.metadata.label)}
                                        description={
                                            (connector as AvailableNode).codedata.org +
                                            " / " +
                                            (connector as AvailableNode).codedata.module
                                        }
                                        icon={
                                            connector.metadata.icon ? (
                                                <img
                                                    src={connector.metadata.icon}
                                                    alt={connector.metadata.label}
                                                    style={{ width: "24px" }}
                                                />
                                            ) : (
                                                <Codicon name="package" />
                                            )
                                        }
                                        onClick={() => {
                                            onSelectConnector(connector as AvailableNode);
                                        }}
                                    />
                                );
                            })}

                        </GridContainer>
                    )}
                </ListContainer>
            )}
            {(!isSearching && connectors.length === 0) && <p>No connectors found</p>}
        </Container>
    );
}

export default ConnectorView;

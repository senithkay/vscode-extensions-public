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
import { Codicon, SearchBox, Typography } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep } from "lodash";
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

interface ConnectorViewProps {
    onSelectConnector: (connector: AvailableNode) => void;
}

export function ConnectorView(props: ConnectorViewProps) {
    const { onSelectConnector } = props;
    const { rpcClient } = useRpcContext();

    const [connectors, setConnectors] = useState<Category[]>([]);
    const [searchText, setSearchText] = useState<string>("");

    useEffect(() => {
        getConnectors();
    }, []);

    const getConnectors = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getBIConnectors({ keyword: "" })
            .then((model) => {
                console.log(">>> bi connectors", model);
                setConnectors(model.categories);
            });
    };

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
            <Typography variant="h2">Select a Connector</Typography>
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
            {filteredCategories && filteredCategories.length > 0 && (
                <ListContainer>
                    {filteredCategories.map((category, index) => {
                        return (
                            <div key={category.metadata.label + index}>
                                <Typography variant="h3">{category.metadata.label}</Typography>
                                <GridContainer>
                                    {category.items?.map((connector, index) => {
                                        return (
                                            <ButtonCard
                                                key={connector.metadata.label + index}
                                                title={connector.metadata.label}
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
                    })}
                </ListContainer>
            )}
            {!connectors || (connectors.length === 0 && <p>No connectors found</p>)}
        </Container>
    );
}

export default ConnectorView;

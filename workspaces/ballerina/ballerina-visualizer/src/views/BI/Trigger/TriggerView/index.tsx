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
import { AvailableNode, BallerinaTrigger, Category, Item, TriggerModelsResponse, TriggerNode, Triggers } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Codicon, ProgressRing, SearchBox, Typography } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep, debounce } from "lodash";
import ButtonCard from "../../../../components/ButtonCard";
import { BodyText } from "../../../styles";
import { useVisualizerContext } from "../../../../Context";

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
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

interface TriggerViewProps {
    onTriggerSelect: (trigger: TriggerNode) => void;
}

export function TriggerView(props: TriggerViewProps) {
    const { onTriggerSelect } = props;
    const { rpcClient } = useRpcContext();

    const [triggers, setTriggers] = useState<TriggerModelsResponse>({ local: [] });
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState(true);

    const { cacheTriggers, setCacheTriggers } = useVisualizerContext();

    useEffect(() => {
        getTriggers();
    }, []);

    const getTriggers = () => {
        if (cacheTriggers.local.length > 0) {
            setTriggers(cacheTriggers);
            setIsSearching(false);
        } else {
            rpcClient
                .getTriggerWizardRpcClient()
                .getTriggerModels({ query: "" })
                .then((model) => {
                    console.log(">>> bi triggers", model);
                    setTriggers(model);
                    setCacheTriggers(model);
                    setIsSearching(false);
                });
        }
    };

    useEffect(() => {
        setIsSearching(true);
        if (!searchText && cacheTriggers.local.length > 0) {
            setTriggers(cacheTriggers);
            setIsSearching(false);
            return;
        }
        debouncedSearch(searchText);
        return () => debouncedSearch.cancel();
    }, [searchText]);

    const handleSearch = (text: string) => {
        rpcClient
            .getTriggerWizardRpcClient()
            .getTriggerModels({ query: text })
            .then((model) => {
                console.log(">>> bi searched triggers", model);
                setTriggers(model);
                setIsSearching(false);
            });
    }
    const debouncedSearch = debounce(handleSearch, 1100);

    const handleOnSearch = (text: string) => {
        setSearchText(text);
    };

    return (
        <Container>
            <Typography variant="h2">Event Integrations</Typography>
            <BodyText>
                Select a trigger to integrate. Use search to quickly find the right one.
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
            {isSearching && (
                <ListContainer style={{ height: '60vh', overflowY: 'scroll' }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <ProgressRing />
                    </div>
                </ListContainer>
            )}
            {!isSearching && (
                <ListContainer>
                    <GridContainer>
                        {triggers.local.map((item, index) => {
                            return (
                                <ButtonCard
                                    key={item.id}
                                    caption={`v${item.version}`}
                                    title={item.name}
                                    description={`${item.orgName}/${item.packageName}`}
                                    icon={
                                        item.icon ? (
                                            <img
                                                src={item.icon}
                                                alt={item.name}
                                                style={{ width: "40px" }}
                                            />
                                        ) : (
                                            <Codicon name="mail" />
                                        )
                                    }
                                    onClick={() => {
                                        onTriggerSelect(item);
                                    }}
                                />
                            );
                        })}
                    </GridContainer>
                </ListContainer>
            )}
            {(!isSearching && triggers.local.length === 0 && <p>No triggers found</p>)}
        </Container>
    );
}

export default TriggerView;

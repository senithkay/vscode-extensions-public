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
import { AvailableNode, Category, Item, TriggerModel } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Codicon, ProgressRing, SearchBox, Typography } from "@wso2-enterprise/ui-toolkit";
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

interface TriggerViewProps {
    onTriggerSelect: (trigger: TriggerModel) => void;
}

export function TriggerView(props: TriggerViewProps) {
    const { onTriggerSelect } = props;
    const { rpcClient } = useRpcContext();

    const [triggers, setTriggers] = useState<TriggerModel[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        getTriggers();
    }, []);

    const getTriggers = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getBITriggers({ queryMap: {} })
            .then((model) => {
                console.log(">>> bi triggers", model);
                setTriggers(model.triggers);
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
            .getBITriggers({ queryMap: { q: text } })
            .then((model) => {
                console.log(">>> bi searched triggers", model);
                setTriggers(model.triggers);
            });
    }
    const debouncedSearch = debounce(handleSearch, 1100);


    useEffect(() => {
        setIsSearching(false);
    }, [triggers]);

    const handleOnSearch = (text: string) => {
        setSearchText(text);
    };


    return (
        <Container>
            <Typography variant="h2">Select a Trigger</Typography>
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
                <ListContainer style={{ height: '80vh', overflowY: 'scroll' }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                        <ProgressRing />
                    </div>
                </ListContainer>)}
            <ListContainer>
                {/* Default triggers of LS is hardcoded and is sent with categories with item field */}
                <GridContainer>
                    {triggers.map((item, index) => {
                        const trigger = item as TriggerModel;
                        return (
                            <ButtonCard
                                key={trigger.name + index}
                                title={trigger.name}
                                description={`${trigger.name} - Message broker based trigger`}
                                icon={<Codicon name="mail" />}
                                onClick={() => {
                                    onTriggerSelect(trigger);
                                }}
                            />
                        );
                    })}¸
                </GridContainer>
            </ListContainer>
            {!isSearching && !triggers || (triggers.length === 0 && <p>No triggers found</p>)}
        </Container>
    );
}

export default TriggerView;

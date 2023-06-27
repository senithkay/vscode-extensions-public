/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";

import styled from "@emotion/styled";

import { NodeCategory, NodeFilter, NodeType } from "../NodeFilter";
import { GraphqlDesignModel } from "../resources/model";
import { OperationTypes, TypeFilter } from "../TypeFilter";
import { getNodeListOfModel } from "../utils/common-util";

interface GraphqlHeaderProps {
    updateFilter: (type: OperationTypes) => void;
    updateNodeFiltering: (node: NodeType) => void;
    designModel: GraphqlDesignModel;
    selectedNode?: NodeType;
}

export function GraphqlHeader(props: GraphqlHeaderProps) {
    const { updateFilter, updateNodeFiltering, designModel, selectedNode } = props;
    const [nodeList, setNodeList] = React.useState<NodeType[]>(undefined);


    useEffect(() => {
        setNodeList(getNodeListOfModel(designModel));
    }, [designModel]);

    return (
        <HeaderContainer>
            <Title> GraphQL Designer </Title>
            <FilterBar>
                <NodeFilter updateNodeFiltering={updateNodeFiltering} nodeList={nodeList} />
                <TypeFilter updateFilter={updateFilter} isFilterDisabled={selectedNode ? (selectedNode.type !== NodeCategory.GRAPHQL_SERVICE) : false} />
            </FilterBar>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.div`
  height: 50px;
  display: flex;
  padding: 15px;
  background-color: #f7f8fb;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(102, 103, 133, 0.15);
`;

const Title = styled.div`
  font-weight: 600;
  margin-right: 10px;
`;

const FilterBar = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import styled from "@emotion/styled";

import { OperationTypes, TypeFilter } from "../TypeFilter";

interface GraphqlHeaderProps {
    updateFilter: (type: OperationTypes) => void;
}

export function GraphqlHeader(props: GraphqlHeaderProps) {
    const { updateFilter } = props;

    return (
        <HeaderContainer>
            <Title> GraphQL Designer </Title>
            <FilterBar>
                <TypeFilter updateFilter={updateFilter} />
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

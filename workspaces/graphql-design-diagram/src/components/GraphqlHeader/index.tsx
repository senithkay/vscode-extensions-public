/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
            <Title> Graphql Designer </Title>
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

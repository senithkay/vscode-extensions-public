/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { SearchBox } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { LogIcon } from "../../resources";
import { Colors } from "../../resources/constants";

namespace S {
    export const Container = styled.div<{}>`
        width: 100%;
    `;

    export const StyledSearchInput = styled(SearchBox)`
        height: 30px;
    `;

    export const Row = styled.div<{}>`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-top: 4px;
        margin-bottom: 4px;
    `;

    export const Grid = styled.div<{}>`
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
    `;

    export const Title = styled.div<{}>`
        font-size: 12px;
        margin-top: 14px;
        margin-bottom: 10px;
    `;

    export const Component = styled.div<{}>`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        padding: 5px;
        border: 1px solid ${Colors.OUTLINE_VARIANT};
        border-radius: 5px;
        height: 25px;
        cursor: pointer;
        font-size: 14px;
        &:hover {
            background-color: ${Colors.PRIMARY_CONTAINER};
            border: 1px solid ${Colors.PRIMARY};
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

interface ComponentListProps {
    onAdd: (kind: string) => void;
}

export function ComponentList(props: ComponentListProps) {
    const { onAdd } = props;

    const [searchText, setSearchText] = useState<string>("");

    const flowControls: { kind: string; label: string }[] = [
        { kind: "IF", label: "If" },
        { kind: "FOR_EACH", label: "Foreach" },
        { kind: "WHILE", label: "While" },
        { kind: "VARIABLE", label: "Variable" },
        { kind: "ASSIGNMENT", label: "Assignment" },
        { kind: "FUNCTION_CALL", label: "Function Call" },
        { kind: "CONNECTOR", label: "Connector" },
        { kind: "ACTION", label: "Action" },
        { kind: "RETURN", label: "Return" }
    ];

    const handleOnSearch = (text: string) => {
        setSearchText(text);
        // TODO: Implement search
    };

    const handleAddNode = (kind: string) => {
        onAdd(kind);
    };

    return (
        <S.Container>
            <S.Row>
                <S.StyledSearchInput value={searchText} autoFocus={true} onChange={handleOnSearch} size={60} />
            </S.Row>
            <S.Row>
                <S.Title>Add Component</S.Title>
            </S.Row>
            <S.Grid>
                {flowControls.map((flowControl, index) => (
                    <S.Component key={index} onClick={() => handleAddNode(flowControl.kind)}>
                        <S.IconContainer>
                            <LogIcon />
                        </S.IconContainer>
                        <div>{flowControl.label}</div>
                    </S.Component>
                ))}
            </S.Grid>
        </S.Container>
    );
}

/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import cn from "classnames";

import styled from "@emotion/styled";
import { ComponentType } from "./types";


const TypeCardContainer = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    width: 200px;
    height: 150px;
    padding: 10px;
    // End Sizing Props
    // Border Props
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
    cursor: pointer;
    &:hover, &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

export interface ComponentTypeCardProps {
    type: ComponentType;
    description: string;
    isSelected: boolean;
    onSelect: (type: ComponentType) => void;
}

export const ComponentTypeCard: React.FC<ComponentTypeCardProps> = (props) => {
    const { type, description, isSelected, onSelect } = props;

    const onSelection = () => {
        onSelect(type);
    };

    return (
        <TypeCardContainer className={cn({ "active": isSelected})} onClick={onSelection}>
            <h2>{type}</h2>
            <p style={{ textAlign: "center"}}>{description}</p>
        </TypeCardContainer>
    );
};

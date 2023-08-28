/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Colors } from "../../../resources";

const ANON_RECORD_PRIMARY: string = "#0d6fbf";
const ANON_RECORD_SECONDARY: string = "#e8f5ff";
const PRIMARY_HOVER: string = "#2c09ed";

interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
    isFocused?: boolean;
    height?: number;
}

export const CellNode: React.FC<any> = styled.div`
    width: ${(props: StyleProps) => props.height}px;
    height: ${(props: StyleProps) => props.height}px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
    position: relative;
    overflow: visible;

    svg {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
    
      polygon {
        stroke: ${Colors.NODE_BORDER};
        stroke-width: 2;
        fill: none;
      }
`;

export const Circle: React.FC<any> = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: ${(props: StyleProps) => `2px solid ${Colors.NODE_BORDER}`};
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: ${Colors.NODE_BACKGROUND};
`;

export const TopPortCircle: React.FC<any> = styled(Circle)`
    position: absolute;
    top: -30px;
    left: 50% - 30px;
`;

export const BottomPortCircle: React.FC<any> = styled(Circle)`
    position: absolute;
    bottom: -30px;
    left: 50% - 30px;
`;

export const LeftPortCircle: React.FC<any> = styled(Circle)`
    position: absolute;
    top: 50% - 30px;
    left: -30px;
`;

export const RightPortCircle: React.FC<any> = styled(Circle)`
    position: absolute;
    top: 50% - 30px;
    right: -30px;
`;

export const BottomPortWrapper: React.FC<any> = styled.div`
    position: absolute;
    bottom: -30px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 40px;
`;

export const Connector: React.FC<any> = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const Label: React.FC<any> = styled.div`
    margin-top: 10px;
`;

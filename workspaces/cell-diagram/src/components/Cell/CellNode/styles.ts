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
}

export const CellNode: React.FC<any> = styled.div`
    width: 1000px;
    height: 1000px;
    color: ${(props: StyleProps) => (props.isAnonymous ? ANON_RECORD_PRIMARY : Colors.DEFAULT_TEXT)};
    border: ${(props: StyleProps) =>
        `2px solid ${
            props.isSelected
                ? Colors.PRIMARY_SELECTED
                : props.isAnonymous
                ? ANON_RECORD_PRIMARY
                : props.isFocused
                ? Colors.PRIMARY_FOCUSED
                : Colors.NODE_BORDER
        }`};
    padding: 10px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
    position: relative;
    overflow: visible;
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
    // background-color: ${Colors.NODE_BACKGROUND};
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
    top: 50%;
    left: -30px;
`;

export const RightPortCircle: React.FC<any> = styled(Circle)`
    position: absolute;
    top: 50%;
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

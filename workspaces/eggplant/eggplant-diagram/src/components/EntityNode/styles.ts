/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Colors } from "../../resources";

const PILL_BACKGROUND: string = "#e1e4f1";
const PRIMARY_HOVER: string = "#2c09ed";

interface StyleProps {
    isAnonymous: boolean;
    isSelected?: boolean;
    isClickable?: boolean;
    isCollapsed?: boolean;
    isFocused?: boolean;
    isPill?: boolean;
}

export const EntityNode: React.FC<any> = styled.div`
    background-color: ${(props: StyleProps) => (props.isPill ? PILL_BACKGROUND : Colors.NODE_BACKGROUND)};
    border: ${(props: StyleProps) =>
        `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : props.isFocused ? Colors.PRIMARY_FOCUSED : Colors.NODE_BORDER}`};
    border-radius: ${(props: StyleProps) => (props.isPill ? "36px" : "6px")} !important;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    padding: 0px;
    cursor: grab;
    &:active {
        cursor: grabbing;
    }
`;

export const RecordFieldContainer: React.FC<any> = styled.div`
  align-items: center;
  background-color: ${(props: StyleProps) => (props.isPill ? PILL_BACKGROUND : Colors.NODE_BACKGROUND)};
  border-radius: ${(props: StyleProps) => (props.isPill ? "36px" : "6px")} !important;
  border-bottom: 0.5px solid #cccde3;
  color: #000000;
  display: flex;
  flex-direction: row;
  font-family: GilmerRegular;
  font-size: 12px;
  height: 30px;
  justify-content: flex-start;
  line-height: 16px;
  min-width: calc(100% - 16px);
  padding: 0px;
  text-align: center;
`;

export const EntityHead: React.FC<any> = styled.div`
    align-items: center;
    display: flex;
    font-family: GilmerMedium;
    font-size: 13px;
    min-height: 30px;
    justify-content: space-between;
    line-height: 20px;
    min-width: ${(props: StyleProps) => (props.isCollapsed ? `calc(100% - 40px)` : `calc(100% - 100px)`)};
    padding: 0px;
    text-align: center;
`;

export const EntityName: React.FC<any> = styled.span`
    &:hover {
        color: ${(props: StyleProps) => (props.isClickable ? PRIMARY_HOVER : ``)};
        cursor: ${(props: StyleProps) => (props.isClickable ? `grabbing` : ``)};
        text-decoration: ${(props: StyleProps) => (props.isClickable ? `underline` : ``)};
    }


`;

export const FieldName: React.FC<any> = styled.span`
  align-items: center;
  color: #000000;
  display: flex;
  flex: 1;
  font-family: GilmerRegular;
  font-size: 12px;
  line-height: 30px;
  min-width: 20px;
  justify-content: center;

  &:hover {
    color: ${(props: StyleProps) => (props.isClickable ? PRIMARY_HOVER : ``)};
    cursor: ${(props: StyleProps) => (props.isClickable ? `grabbing` : ``)};
    text-decoration: ${(props: StyleProps) => (props.isClickable ? `underline` : ``)};
}
`;

export const AttributeContainer: React.FC<any> = styled.div`
    align-items: center;
    background-color: ${(props: { isSelected: boolean }) => (props.isSelected ? Colors.SECONDARY_SELECTED : "#FFFFFF")};
    border: 0.5px solid ${Colors.NODE_BORDER};
    display: flex;
    flex-direction: row;
    font-size: 12px;
    gap: 15px;
    height: 35px;
    justify-content: space-between;
    min-width: calc(100% - 40px);
    padding: 8px 8px 8px 32px;
`;

export const AttributeName = styled.span`
    align-items: center;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex: 1;
    font-family: GilmerRegular;
    font-size: 12px;
    line-height: 16px;
    text-align: left;
`;

export const AttributeType: React.FC<any> = styled.span`
    background-color: ${(props: StyleProps) => (props.isSelected ? Colors.SHADED_SELECTED : Colors.SECONDARY)};
    border-radius: 3px;
    color: #000000;
    font-family: GilmerRegular;
    font-size: 12px;
    height: 20px;
    gap: 10px;
    line-height: 20px;
    min-width: 50px;
    padding-inline: 8px;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
`;

export const OutPortsWrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
`;

export const OutPorts = styled.div`
    display: flex;
`;

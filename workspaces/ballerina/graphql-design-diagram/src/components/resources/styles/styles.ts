/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";

import { Colors } from "../model";

export const FieldType: React.FC<any> = styled.span`
  background-color: ${Colors.SECONDARY};
  border-radius: 3px;
  color: #000000;
  font-family: GilmerRegular;
  font-size: 12px;
  height: 24px;
  line-height: 24px;
  min-width: 60px;
  padding-inline: 6px;
  text-align: center;
`;

export const FieldName: React.FC<any> = styled.span`
  align-items: center;
  color: #000000;
  display: flex;
  flex: 1;
  font-family: GilmerRegular;
  font-size: 12px;
  line-height: 30px;
  padding-right: 8px;
  text-align: left;
`;

export const HeaderName: React.FC<any> = styled.span`
  margin-left: 8px;
  margin-right: 15px;
`;

interface StyleProps {
    isSelected?: boolean;
}

export const NodeContainer: React.FC<any> = styled.div`
  background-color: ${Colors.SECONDARY};
  border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_FOCUSED : Colors.PRIMARY}`};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  color: ${Colors.PRIMARY};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 32px;
`;

export const NodeHeader: React.FC<any> = styled.div`
  align-items: center;
  border-bottom: ${(props: StyleProps) =>
          `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}`};
  display: flex;
  font-family: GilmerRegular;
  font-size: 13px;
  height: 32px;
  justify-content: space-between;
  line-height: 24px;
  padding-inline: 8px;
  min-width: calc(100% - 16px);
  text-align: center;
  white-space: nowrap;
`;

export const InterfaceSubHeader: React.FC<any> = styled.div`
  align-items: center;
  display: flex;
  font-family: GilmerRegular;
  font-size: 13px;
  justify-content: center;
  line-height: 24px;
  min-width: 160px;
  text-align: center;
  white-space: nowrap;
`;

export const NodeFieldContainer: React.FC<any> = styled.div`
  align-items: center;
  background-color: #FFFFFF;
  border-bottom: 0.5px solid #cccde3;
  color: #000000;
  display: flex;
  flex-direction: row;
  font-family: GilmerRegular;
  font-size: 12px;
  height: 30px;
  justify-content: center;
  line-height: 16px;
  min-width: calc(100% - 16px);
  padding: 8px 0px 8px 8px;
  text-align: center;
`;

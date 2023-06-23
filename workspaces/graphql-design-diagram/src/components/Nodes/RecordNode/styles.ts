/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";

import { Colors } from "../../resources/model";

interface StyleProps {
    isSelected?: boolean;
}

export const RecordNode: React.FC<any> = styled.div`
  background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED : Colors.SECONDARY};
  border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}`};
  border-radius: 2px !important;
  color: ${Colors.PRIMARY};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 32px;
  min-width: 160px;
  opacity: 1;
`;

export const RecordHead: React.FC<any> = styled.div`
  align-items: center;
  border-bottom: ${(props: StyleProps) =>
          `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}`};
  display: flex;
  font-family: ${(props: StyleProps) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
  font-size: 13px;
  height: 32px;
  justify-content: center;
  line-height: 24px;
  padding-inline: 8px;
  min-width: calc(100% - 16px);
  text-align: center;
  white-space: nowrap;
`;

export const RecordFieldContainer: React.FC<any> = styled.div`
  align-items: center;
  background-color: ${(props: StyleProps) => props.isSelected ? Colors.SECONDARY_SELECTED : '#FFFFFF'};
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
  padding: 8px 8px 8px 8px;
  text-align: center;
`;

export const RecordName: React.FC<any> = styled.div`
  display: flex;
  flex: 1;
  height: 30px;
  line-height: 30px;
  text-align: left;
  white-space: nowrap;
`;

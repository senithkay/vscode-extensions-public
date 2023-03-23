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

import styled from "@emotion/styled";

import { Colors } from "../model";

export const FieldType = styled.span`
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

export const FieldName = styled.span`
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

export const HeaderName = styled.span`
  margin-left: 8px;
`;

export const NodeContainer = styled.div`
  background-color: ${Colors.SECONDARY};
  border: ${`1px solid ${Colors.PRIMARY}`};
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

export const NodeHeader = styled.div`
  align-items: center;
  border-bottom: ${`1px solid ${Colors.PRIMARY}`};
  display: flex;
  font-family: GilmerRegular;
  font-size: 13px;
  height: 32px;
  justify-content: center;
  line-height: 24px;
  padding-inline: 8px;
  min-width: 160px;
  text-align: center;
  white-space: nowrap;
`;

export const InterfaceNodeHeader = styled.div`
  align-items: center;
  display: flex;
  font-family: GilmerRegular;
  border-bottom: ${`1px solid ${Colors.PRIMARY}`};
  font-size: 13px;
  justify-content: center;
  line-height: 24px;
  padding-inline: 8px;
  min-width: 160px;
  text-align: center;
  white-space: nowrap;
  flex-direction: column;
`;

export const InterfaceSubHeader = styled.div`
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

export const NodeFieldContainer = styled.div`
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
  padding: 8px 8px 8px 8px;
  text-align: center;
`;

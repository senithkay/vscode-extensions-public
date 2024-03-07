/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";

export const Container: React.FC<any> = styled.div`
  display: flex;
  flex-direction: row;
  font-family: GilmerRegular;
  font-size: 13px;
  letter-spacing: 0.8px;
`;

export const popOverCompStyle = {
  backgroundColor: "white",
  border: "1px solid black",
  padding: "10px",
  borderRadius: "5px",
  display: "flex",
  flexDirection: "column",
  maxWidth: "280px",
  gap: "8px",
};

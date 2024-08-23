/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import styled from "@emotion/styled";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { Codicon } from "@wso2-enterprise/ui-toolkit";

interface AIMapButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 5px;
`;

const StyledButton = styled(Button) <{ isLoading: boolean }>`
  box-sizing: border-box;
  box-shadow: 0px 1px 2px var(--vscode-widget-shadow);
  border-radius: 3px;
  color: ${({ isLoading }) => (isLoading ? "var(--vscode-button-foreground)" : "var(--vscode-editor-foreground)")};
  font-size: smaller;
  height: 30px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  min-width: 80px;
`;

const AIMapButton: React.FC<AIMapButtonProps> = ({ onClick, isLoading }) => {
  return (
    <ButtonContainer>
      <StyledButton
        appearance= "secondary" 
        tooltip="Generates Mappings using AI"
        onClick={async () => {
          if (!isLoading) {
            await onClick();
          }
        }}
        disabled={isLoading}
        isLoading={isLoading}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Codicon name="wand" />
          <span style={{ marginLeft: "3px" }}>Map</span>
        </div>
      </StyledButton>
    </ButtonContainer>
  );
};

export default AIMapButton;

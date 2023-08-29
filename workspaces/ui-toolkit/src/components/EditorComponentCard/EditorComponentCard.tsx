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
import React from "react";

import styled from "@emotion/styled";
import classNames from "classnames";

export interface ComponentCardProps {
    isAllowed: boolean;
    children: React.ReactNode;
    onClick: () => void;
}

const ComponentContainer = styled.div`
  height: 50px;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid var(--vscode-editor-foreground);
  display: flex;
  align-items: center;
  padding: 10px;
  justify-content: left;
  width: 200px;
  margin-right: 16px;
  margin-bottom: 16px;
  transition: 0.3s;
  color: var(--vscode-editor-foreground);

  .icon svg g {
    fill: var(--vscode-editor-foreground);;
  }

  &.not-allowed {
    cursor: not-allowed;
  }

  &:hover {
    border: 1px solid var(--vscode-focusBorder);
    background-color: var(--vscode-pickerGroup-border);
    color: var(--vscode-editor-foreground);
    .icon svg g {
      fill: var(--vscode-editor-foreground);
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
  }

  .label {
    padding: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .break {
    flex: 1;
  }

  .title {
    font-size: 16px;
  }

  .file {
    display: flex;
    flex-direction: row-reverse;
  }
`;

export const EditorCardComponent: React.FC<ComponentCardProps> = (props: ComponentCardProps) => {
    const { isAllowed, children, onClick } = props;

    return (
        <ComponentContainer
            className={classNames("component", { 'not-allowed': !isAllowed })}
            onClick={onClick}
        >
            {children}
        </ComponentContainer>
    )
};

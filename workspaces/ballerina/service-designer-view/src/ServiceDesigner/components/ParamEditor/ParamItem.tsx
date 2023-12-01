/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { PARAM_TYPES } from "./ParamEditor";
import { ParamIcon } from "./ParamIcon";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";
import { Codicon } from "@wso2-enterprise/ui-toolkit";

export interface ParameterConfig {
    id: number;
    name: string;
    type?: string;
    option?: PARAM_TYPES;
    defaultValue?: string;
}

interface ParamItemProps {
    param: ParameterConfig;
    readonly: boolean;
    onDelete?: (param: ParameterConfig) => void;
    onEditClick?: (param: ParameterConfig) => void;
}

const ContentSection = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`;

const EditIconWrapper = styled.div`
    cursor: pointer;
    height: 14px;
    width: 14px;
    margin-top: 16px;
    margin-bottom: 13px;
    margin-left: 10px;
    color: var(--vscode-statusBarItem-remoteBackground);
`;

const DeleteIconWrapper = styled.div`
    cursor: pointer;
    height: 14px;
    width: 14px;
    margin-top: 16px;
    margin-bottom: 13px;
    margin-left: 10px;
    color: var(--vscode-notificationsErrorIcon-foreground);
`;

const IconWrapper = styled.div`
    cursor: pointer;
    height: 14px;
    width: 14px;
    margin-top: 16px;
    margin-bottom: 13px;
    margin-left: 10px;
`;

const IconTextWrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: 225px;
    cursor: pointer;
    background-color: var(--vscode-inputValidation-infoBackground);
    height: 100%;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
`;

// const HeaderWrapper = styled.div`
//     display: flex;
// `;

const headerLabelStyles = cx(css`
    display: flex;
    align-items: center;
    width: 320px;
    cursor: pointer;
    margin-left: 12px;
    line-height: 14px;
`);

const OptionLabel = styled.div`
    font-size: 12px;
    line-height: 14px;
    margin-left: 5px;
`;

const disabledHeaderLabel = cx(css`
    display: flex;
    align-items: center;
    width: 320px;
    margin-left: 12px;
    line-height: 14px;
`);

const HeaderLabel = styled.div`
    display: flex;
    background: var(--vscode-editor-background);
    border-radius: 5px;
    border: 1px solid var(--vscode-dropdown-border);
    margin-top: 8px;
    display: flex;
    width: 100%;
    height: 32px;
    align-items: center;
`;

const ActionIconWrapper = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    height: 14px;
    width: 14px;
`;


export function ParamItem(props: ParamItemProps) {
    const { param, readonly, onDelete, onEditClick } = props;

    const label = param?.type ? `${param.type} ${param.name}${param.defaultValue ? ` = ${param.defaultValue}` : ""}`
        : `${param.name}`;
    const handleDelete = () => {
        onDelete(param);
    };
    const handleEdit = () => {
        if (!readonly) {
            onEditClick(param);
        }
    };

    console.log("ParamItem.tsx: handleEdit: param: ", handleDelete);

    // const icon = (<ParamIcons type={param?.option} />);

    return (
        <HeaderLabel data-testid={`${label}-item`}>
            <IconTextWrapper onClick={handleEdit}>
                <IconWrapper>
                    <ParamIcon option={param?.option?.toLowerCase()} />
                </IconWrapper>
                <OptionLabel>
                    {param?.option?.toLowerCase()}
                </OptionLabel>
            </IconTextWrapper>
            <ContentSection>
                <div
                    data-test-id={`${label}-param`}
                    className={readonly ? disabledHeaderLabel : headerLabelStyles}
                    onClick={handleEdit}
                >
                    {label}
                </div>
                {!readonly && (
                    <ActionIconWrapper>
                        <EditIconWrapper>
                            <Codicon name="edit" onClick={handleEdit} />
                        </EditIconWrapper>
                        <DeleteIconWrapper>
                            <Codicon name="trash" onClick={handleDelete} />
                        </DeleteIconWrapper>
                    </ActionIconWrapper>
                 )}
            </ContentSection>
        </HeaderLabel>
    );
}``

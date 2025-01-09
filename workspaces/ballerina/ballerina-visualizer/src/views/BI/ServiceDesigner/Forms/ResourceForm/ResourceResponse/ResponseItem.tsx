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

import { Codicon, Icon } from "@wso2-enterprise/ui-toolkit";
import { ActionIconWrapper, ContentSection, DeleteIconWrapper, EditIconWrapper, HeaderLabel, IconTextWrapper, IconWrapper, OptionLabel, disabledHeaderLabel, headerLabelStyles } from "../styles";
import { HTTP_METHOD, getDefaultResponse } from "../utils";
import { StatusCodeResponse } from "@wso2-enterprise/ballerina-core";

interface ParamItemProps {
    response: StatusCodeResponse;
    readonly: boolean;
    onDelete?: () => void;
    onEditClick?: (param: StatusCodeResponse) => void;
}

export function ResponseItem(props: ParamItemProps) {
    const { response, readonly, onDelete, onEditClick } = props;

    const handleDelete = () => {
        onDelete();
    };
    const handleEdit = () => {
        if (!readonly) {
            onEditClick(response);
        }
    };

    return (
        <HeaderLabel data-testid={`${response.statusCode.value}-item`}>
            <IconTextWrapper onClick={handleEdit}>
                <IconWrapper>
                    <Icon name="header" />
                </IconWrapper>
                <OptionLabel>
                    {response.statusCode.value}
                </OptionLabel>
            </IconTextWrapper>
            <ContentSection>
                <div
                    data-test-id={`${response.body.value}-resp`}
                    className={readonly ? disabledHeaderLabel : headerLabelStyles}
                    onClick={handleEdit}
                >
                    {response.body.value || response.type.value}
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
}

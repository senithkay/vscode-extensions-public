/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from "react";
import {
    VSCodeDropdown,
    VSCodeOption,
    VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { ErrorBanner } from "../Commons/ErrorBanner";

export interface OptionProps {
    id?: string;
    content?: string | ReactNode;
    value: string;
}

export interface DropdownProps {
    id: string;
    isLoading?: boolean;
    label?: string;
    value?: string;
    disabled?: boolean;
    items?: OptionProps[];
    errorMsg?: string;
    sx?: any;
    onChange?: (value: string) => void;
}

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 3px);
    width: calc(var(--design-unit) * 3px);
    margin-top: auto;
    padding: 4px;
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap : 4px;
    color: var(--vscode-editor-foreground);
`;

export const Dropdown: React.FC<DropdownProps> = (props: DropdownProps) => {
    const { isLoading, value, id, items, label, errorMsg, disabled, sx, onChange } = props;

    return (
        <>
            {isLoading ? (
                <SmallProgressRing />
            ) : (
                <DropDownContainer>
                    <label htmlFor={id}>{label}</label>
                    <VSCodeDropdown value={value} id={id} onChange={(e: any) => onChange(e.target.value)} style={sx} disabled={disabled}>
                        {items?.map((item: OptionProps) => (
                            <VSCodeOption key={item?.id} value={item.value}>
                                {item?.content || item.value}
                            </VSCodeOption>
                        ))}
                    </VSCodeDropdown>
                    {errorMsg && (
                        <ErrorBanner errorMsg={errorMsg} />
                    )}
                </DropDownContainer>
            )}
        </>
    );
};

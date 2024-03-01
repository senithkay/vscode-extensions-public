/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import React from "react";

const CheckBoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export type CheckBoxProps = {
    label: string;
    value: string | number;
    checked?: boolean;
    onClick?: (e: React.SyntheticEvent) => void;
};

export type CheckBoxGroupProps = React.ComponentPropsWithoutRef<"div"> & {
    values?: string[];
    onChange: (selected: string[]) => void;
};

export const CheckBox = ({ label, value, checked, onClick }: CheckBoxProps) => {
    return (
        <VSCodeCheckbox value={value} checked={checked} onClick={onClick}>
            {label}
        </VSCodeCheckbox>
    );
};

export const CheckBoxGroup = ({ values, onChange, children }: CheckBoxGroupProps) => {
    const selected = React.useRef<string[]>(values || []);

    return (
        <CheckBoxContainer>
            {React.Children.toArray(children).map(child => {
                const checkBox = child as React.ReactElement<CheckBoxProps>;
                const label = checkBox.props.label;
                return React.cloneElement(checkBox, {
                    onClick: (e: React.SyntheticEvent) => {
                        const target = e.target as HTMLInputElement;
                        if (target.checked) {
                            selected.current = [...selected.current, label];
                        } else {
                            selected.current = selected.current.filter(item => item !== label);
                        }
                        onChange(selected.current);
                    },
                    checked: selected.current.indexOf(label) > -1,
                });
            })}
        </CheckBoxContainer>
    );
};

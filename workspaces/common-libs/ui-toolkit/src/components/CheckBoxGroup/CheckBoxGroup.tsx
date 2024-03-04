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
    value: string;
    checked?: boolean;
    onChange?: (value: string, checked: boolean) => void;
};

export type CheckBoxGroupProps = {
    items: CheckBoxProps[];
    selected?: string[];
    onChange: (selected: string[]) => void;
};

export const CheckBox = ({ label, value, checked, onChange }: CheckBoxProps) => {
    const [selected, toggleSelected] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (checked) {
            toggleSelected(checked);
        }
    }, [checked]);

    const handleCheckBoxChange = () => {
        toggleSelected(!selected);
        onChange!(label, !selected);
    };

    return (
        <VSCodeCheckbox value={value} checked={selected} onClick={handleCheckBoxChange}>
            {label}
        </VSCodeCheckbox>
    );
}

export const CheckBoxGroup = ({ items, selected, onChange }: CheckBoxGroupProps) => {
    const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (selected && selected.length > 0) {
            setSelectedItems(selected);
        }
    }, [selected]);

    const handleCheckBoxChange = (label: string, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, label]);
            onChange([...selectedItems, label]);
        } else {
            setSelectedItems(selectedItems.filter(item => item !== label));
            onChange(selectedItems.filter(item => item !== label));
        }
    };

    return (
        <CheckBoxContainer>
            {items.map((item, index) => (
                <CheckBox
                    key={index}
                    label={item.label}
                    value={item.value}
                    checked={selectedItems.indexOf(item.label) > -1}
                    onChange={handleCheckBoxChange}
                />
            ))}
        </CheckBoxContainer>
    );
};

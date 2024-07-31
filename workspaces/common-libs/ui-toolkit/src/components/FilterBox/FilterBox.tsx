/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import { Codicon } from '../Codicon/Codicon';
import { TextField } from '../TextField/TextField';
import { CheckBox, CheckBoxGroup } from '../CheckBoxGroup/CheckBoxGroup';

export interface FilterBoxProps {
    value: string;
    label?: string;
    id?: string;
    icon?: React.ReactNode;
    iconPosition?: "start" | "end";
    autoFocus?: boolean;
    size?: number;
    type?: "email" | "password" | "tel" | "text" | "url";
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    sx?: any;
    onChange?: (e: string) => void;
}

const filterIcon = (<Codicon name="filter" sx={{ cursor: "auto" }} />);

export function FilterBox(props: FilterBoxProps) {
    const { label, size, disabled, readonly, value, id,
        icon, iconPosition, autoFocus, onChange, placeholder, sx
    } = props;
    const handleChange = (value: string) => {
        onChange && onChange(value);
    }
    return (
        <>
            <TextField
                autoFocus={autoFocus}
                icon={{ iconComponent: icon ?? filterIcon, position: iconPosition || "start" }}
                size={size}
                disabled={disabled}
                readonly={readonly}
                placeholder={placeholder}
                label={label}
                onTextChange={handleChange}
                value={value || ""}
                id={id}
                sx={sx}
                inputProps={{
                    endAdornment: (
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Codicon name="close" onClick={() => { handleChange("") }} />
                            <div>
                                <Codicon name="chevron-down" />
                                <div style={{ position: "absolute", top: "100%", right: "0" ,zIndex: 1000}}>
                                    <CheckBoxGroup direction="vertical">
                                        <CheckBox
                                            checked={false}
                                            label="Option 1"
                                            onChange={() => { }}
                                            value="option-1"
                                        />
                                        <CheckBox
                                            checked
                                            label="Option 2"
                                            onChange={() => { }}
                                            value="option-2"
                                        />
                                    </CheckBoxGroup>
                                </div>
                            </div>
                            
                        </div>
                    ),
                }}
            />
            
        </>
    );
}

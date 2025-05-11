/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useRef } from "react";
import {VSCodeColors} from "../../../resources/constants";

interface EditableDivProps {
    label?: string;
    icon?: React.ReactNode;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    contentEditable?: boolean;
}

const EditableDiv: React.FC<EditableDivProps> = ({
    label,
    placeholder,
    value,
    onChange,
    icon,
    contentEditable,
}: EditableDivProps & {}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const isPlaceholderVisible = value.trim() === "";

    useEffect(() => {
        const el = divRef.current;
        if (el && document.activeElement !== el) {
            el.innerText = isPlaceholderVisible ? placeholder : value;
            el.style.color = isPlaceholderVisible
                ? VSCodeColors.ON_SURFACE
                : VSCodeColors.ON_SECONDARY;
        }
    }, [value, placeholder]);

    const handleInput = () => {
        const newText = divRef.current?.innerText ?? "";
        onChange(newText);
    };

    const handleFocus = () => {
        const el = divRef.current;
        if (el && isPlaceholderVisible) {
            el.innerText = "";
            el.style.color = VSCodeColors.ON_SECONDARY;
        }
    };

    const handleBlur = () => {
        const el = divRef.current;
        if (el && el.innerText.trim() === "") {
            el.innerText = placeholder;
            el.style.color = VSCodeColors.ON_SURFACE;
        }
    };

    return (
        <>
            {(label || icon) && (
                <label style={{ display: "flex", fontWeight: "bold" }}>
                    {label && <span>{label}</span>}
                    {icon && <span style={{ marginLeft: "8px" }}>{icon}</span>}
                </label>
            )}
            <div
                ref={divRef}
                contentEditable={contentEditable ? contentEditable : false}
                onInput={handleInput}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                    borderRadius: "8px",
                    padding: "2px",
                    fontFamily: "sans-serif",
                    whiteSpace: "pre-wrap",
                    outline: "none",
                }}
            />
        </>
    );
};

export default EditableDiv;

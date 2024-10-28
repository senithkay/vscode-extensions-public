/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import { Dropdown, LinkButton } from "@wso2-enterprise/ui-toolkit";

import { FormField } from "../Form/types";
import { getValueForDropdown } from "./utils";
import { useFormContext } from "../../context";
import styled from "@emotion/styled";

namespace S {
    export const Container = styled.div({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    });

    export const LabelContainer = styled.div({
        display: 'flex',
        alignItems: 'center',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
    });

    export const Description = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
    });
}

interface MultiSelectEditorProps {
    field: FormField;
    label: string;
}

export function MultiSelectEditor(props: MultiSelectEditorProps) {
    const { field, label } = props;
    const { form } = useFormContext();
    const { register, setValue, watch } = form;
    const [dropdownCount, setDropdownCount] = useState(1);

    // Get the default value
    const defaultValue = getValueForDropdown(field, 0);

    // Watch all the individual dropdown values, including the default value
    const values = [...Array(dropdownCount)].map((_, index) => {
        const value = watch(`${field.key}-${index}`);
        // Return default value for first dropdown if no value is selected
        return index === 0 && !value ? defaultValue : value;
    }).filter(Boolean);

    // Update the main field with the array of values
    useEffect(() => {
        setValue(field.key, values);
    }, [values, field.key, setValue]);

    // HACK: create values for Scope field
    if (field.key === "scope") {
        field.items = ["Global", "Local"];
    }

    const onAddAnother = () => {
        setDropdownCount((prev) => prev + 1);
    };

    return (
        <S.Container>
            <S.LabelContainer>
                <S.Label>{field.label}</S.Label>
            </S.LabelContainer>
            <S.Description>{field.documentation}</S.Description>
            {[...Array(dropdownCount)].map((_, index) => (
                <Dropdown
                    key={`${field.key}-${index}`}
                    id={`${field.key}-${index}`}
                    {...register(`${field.key}-${index}`, { 
                        required: !field.optional && index === 0,
                        value: index === 0 ? getValueForDropdown(field) : undefined 
                    })}
                    items={field.items?.map((item) => ({ id: item, content: item, value: item }))}
                    required={!field.optional && index === 0}
                    disabled={!field.editable}
                    sx={{ width: "100%" }}
                    containerSx={{ width: "100%" }}
                />
            ))}
            <LinkButton onClick={onAddAnother}>
                {label}
            </LinkButton>
        </S.Container>
    );
}

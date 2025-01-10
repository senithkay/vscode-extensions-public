/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import { Dropdown, LocationSelector, RadioButtonGroup } from "@wso2-enterprise/ui-toolkit";

import { FormField } from "../Form/types";
import { capitalize, getValueForDropdown } from "./utils";
import { useFormContext } from "../../context";
import styled from "@emotion/styled";
import { PropertyModel } from "@wso2-enterprise/ballerina-core";
import { EditorFactory } from "./EditorFactory";

interface ChoiceFormProps {
    field: FormField;
}

const Form = styled.div`
    display: grid;
    gap: 20px;
    width: 100%;
`;

const ChoiceSection = styled.div`
    display: grid;
    gap: 20px;
    width: 100%;
`;

const FormSection = styled.div`
    display: grid;
    gap: 20px;
    width: 100%;
`;

export function ChoiceForm(props: ChoiceFormProps) {
    const { field } = props;
    const { form } = useFormContext();
    const { register, control } = form;

    const [selectedOption, setSelectedOption] = useState<number>(0);

    const [dynamicFields, setDynamicFields] = useState<FormField[]>([]);


    // Add useEffect to set initial values
    useEffect(() => {
        const property = field.choices[selectedOption];
        setDynamicFields(convertConfig(property));
    }, [selectedOption]);



    const convertConfig = (model: PropertyModel): FormField[] => {
        const formFields: FormField[] = [];
        for (const key in model.properties) {
            const expression = model.properties[key];
            const formField: FormField = {
                key: key,
                label: expression?.metadata.label || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
                type: expression.valueType === "EXPRESSION" ? "Default" : expression.valueType,
                documentation: expression?.metadata.description || "",
                valueType: expression.valueTypeConstraint,
                editable: expression.editable,
                optional: expression.optional,
                value: expression.value,
                valueTypeConstraint: expression.valueTypeConstraint,
                advanced: expression.advanced,
                diagnostics: [],
                items: expression.valueType === "SINGLE_SELECT" ? [""].concat(expression.items) : expression.items,
                choices: expression.choices,
                placeholder: expression.placeholder
            }
            formFields.push(formField);
        }
        console.log("Dynamic Form Fields:", formFields)
        return formFields;
    }

    return (
        <Form>
            <ChoiceSection>
                <RadioButtonGroup
                    id="options"
                    label={field.documentation}
                    defaultValue={selectedOption}
                    defaultChecked={true}
                    value={selectedOption}
                    {...register(field.key, {
                        setValueAs: () => selectedOption
                    })}
                    options={field.choices.map((choice, index) => ({ id: index.toString(), value: index, content: choice.metadata.label }))}
                    onChange={(e) => {
                        console.log("Choice Form Index:", Number(e.target.value))
                        setSelectedOption(Number(e.target.value));
                    }}
                />
            </ChoiceSection>

            <FormSection>
                {dynamicFields.map((dfield) => {
                    return (
                        <EditorFactory
                            field={dfield}
                        />
                    );
                })}
            </FormSection>

        </Form>

    );
}



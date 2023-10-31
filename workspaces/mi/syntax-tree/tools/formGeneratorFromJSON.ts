/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import path = require("path");
import * as fs from "fs";

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function fixIndentation(str: string, parentIndent: number) {
    const firstLine = str.split('\n')[1];
    const rootIndent = firstLine.trimEnd().length - firstLine.trim().length;
    return str.split('\n').map(line => {
        if (line.trim().length > 0) {
            const currentIndent = line.trimEnd().length - line.trim().length;
            if ((currentIndent - rootIndent + parentIndent) < 0) console.error(line);
            line = ' '.repeat(currentIndent - rootIndent + parentIndent) + line.trim();
        }
        return line;
    }).join('\n');
}

const generateForm = (jsonFilePath: string, tsFilePath: string) => {
    const jsonData = JSON.parse(fs.readFileSync(path.resolve(jsonFilePath), 'utf-8'));
    const name = `${capitalizeFirstLetter(jsonData.connectorName)}Form`;

    let componentContent = '';
    let formValidators = '\n';
    let fields = '';

    const generateFormItems = (elements: any[], indentation: number, parentName?: string) => {
        elements.forEach((element, index) => {
            if (element.type === 'attribute') {
                const { name, displayName, inputType, required, helpTip, allowedConnectionTypes, validation, validationRegEx } = element.value;
                const inputName = parentName ? `${parentName}${name.trim().replace(/\s/g, '_')}` : name.trim().replace(/\s/g, '_');
                const isRequired = required == 'true';

                const validator = `"${inputName}": (e?: any) => validateField("${inputName}", e ?? (formValues as any)["${inputName}"], ${isRequired}, ${validation ? `"${validation}"` : validation}, ${validationRegEx ? `"${validationRegEx}"` : validationRegEx}),\n`;

                if (inputType === 'stringOrExpression' || inputType === 'string') {
                    formValidators += validator;

                    fields +=
                        fixIndentation(`
                        <TextField
                            label="${displayName}"
                            size={50}
                            placeholder="${helpTip}"
                            value={(formValues as any)["${inputName}"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "${inputName}": e });
                                formValidators["${inputName}"](e);
                            }}
                            required={${isRequired}}
                        />
                        {(errors as any)["${inputName}"] && <Error>{(errors as any)["${inputName}"]}</Error>}\n`, indentation);
                } else if (inputType === 'connection') {
                    formValidators += validator;

                    let dropdownStr = '';
                    dropdownStr += `
                    <label>${displayName}</label> ${isRequired ? `<RequiredFormInput />` : ''}
                    <VSCodeDropdown
                        label="${displayName}"
                        value={(formValues as any)["${inputName}"]}
                        autoWidth={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "${inputName}": e.target.value });
                            formValidators["${inputName}"](e);
                        }}
                        style={{ color: 'var(--vscode-editor-foreground)', width: '100%' }}
                    >`;

                    allowedConnectionTypes.map((value: string) => (
                        dropdownStr += `
                        <VSCodeOption
                            style={{
                                color: 'var(--vscode-editor-foreground)',
                                background: 'var(--vscode-editor-background)'
                            }}>${value}</VSCodeOption>`
                    ));

                    dropdownStr += `
                    </VSCodeDropdown>
                    {(errors as any)["${inputName}"] && <Error>{(errors as any)["${inputName}"]}</Error>}\n`;
                    fields +=
                        fixIndentation(dropdownStr, indentation);
                } else if (inputType === 'comboOrExpression') {
                    formValidators += validator;

                    const comboValues = element.value.comboValues;
                    let comboStr = `
                        <label>${displayName}</label> ${isRequired ? `<RequiredFormInput />` : ''}
                        <AutoComplete items={[${comboValues.map((value: string) => `"${value}"`)}]} selectedItem={(formValues as any)["${inputName}"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "${inputName}": e });
                            formValidators["${inputName}"](e);
                        }} />`;
                    fields +=
                        fixIndentation(comboStr, indentation);
                }
            } else if (element.type === 'attributeGroup') {
                fields +=
                    fixIndentation(`
                    <Card>    
                        <h3>${element.value.groupName}</h3>\n`, indentation);
                generateFormItems(element.value.elements, indentation + 4, `${element.value.groupName.trim().replace(/\s/g, '_')}.`);
                fields += fixIndentation(`
                </Card>`, indentation);
            }
        });
    };

    generateFormItems(jsonData.elements, 12);

    componentContent +=
        fixIndentation(`
        import React, { useState } from 'react';
        import { AutoComplete, Button, colors, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
        import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
        import styled from '@emotion/styled';

        interface CardContainerProps {
            sx?: any;
        }

        const Card = styled.div<CardContainerProps>\`
            margin: 5px 0;
            display: block;
            padding: 0 15px 15px 15px;
            width: auto;
            border: 1px solid \${colors.vscodeEditorWidgetBorder};
            \${(props: CardContainerProps) => props.sx};
        \`;

        const Error = styled.span\`
            color: var(--vscode-errorForeground);
            font-size: 12px;
        \`;

        const emailRegex = /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/g;
        const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

        const ${name} = () => {
            const [formValues, setFormValues] = useState({});
            const [errors, setErrors] = useState({});

            const onClick = () => {
                let newErrors: any = {};
                Object.keys(formValidators).forEach((key) => {
                    const error = formValidators[key]();
                    if (error) {
                        newErrors[key] = (error);
                    }
                });
                if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                } else {
                    console.log('Success:', formValues);
                }
            };

            const formValidators: { [key: string]: (e?: any) => string | undefined } = {${fixIndentation(formValidators, 16)}
            };

            const validateField = (id: string, value: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
                let newErrors = { ...errors };
                let error;
                if (isRequired && !value) {
                    error = "This field is required";
                } else if (validation === "e-mail" && !value.match(emailRegex)) {
                    error = "Invalid e-mail address";
                } else if (validation === "nameWithoutSpecialCharactors" && !value.match(nameWithoutSpecialCharactorsRegex)) {
                    error = "Invalid name";
                } else if (validation === "custom" && !value.match(regex)) {
                    error = "Invalid input";
                } else {
                    delete (newErrors as any)[id];
                    setErrors(newErrors);
                }
                setErrors({ ...errors, [id]: error });
                return error;
            };

            return (
                <div style={{ padding: "10px" }}>\n`, 0);
    componentContent += fields;

    componentContent += fixIndentation(`

            <div style={{ textAlign: "right", marginTop: "10px" }}>    
                <Button
                    appearance="primary"
                    onClick={onClick}
                >
                    Submit
                </Button>
            </div>\n
        </div>
    );
};

export default ${name}; \n`, 0);

    // fs.writeFileSync(path.resolve(tsFilePath), componentContent);
    console.log(componentContent);
};

generateForm(path.join(__dirname, '../../generated/test.json'), 'path/to/ts/file');

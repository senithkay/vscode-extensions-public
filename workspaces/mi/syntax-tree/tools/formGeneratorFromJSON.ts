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
import { LICENSE_HEADER } from "./commons";

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function fixIndentation(str: string, parentIndent: number) {
    const firstLine = str.split('\n')[1];
    const rootIndent = firstLine.trimEnd().length - firstLine.trim().length;
    return str.split('\n').map(line => {
        if (line.trim().length > 0) {
            const currentIndent = line.trimEnd().length - line.trim().length;
            if ((currentIndent - rootIndent + parentIndent) > 0) line = ' '.repeat(currentIndent - rootIndent + parentIndent) + line.trim();
        }
        return line;
    }).join('\n');
}

const generateForm = (jsonData: any): string => {
    const operationName = jsonData.operationName;
    const connectorName = jsonData.connectorName;
    const operationNameCapitalized = `${capitalizeFirstLetter(operationName)}Form`;

    let componentContent = '';
    let formValidators = '\n';
    let fields = '';

    const generateFormItems = (elements: any[], indentation: number, parentName?: string) => {
        elements.forEach((element, index) => {
            if (element.type === 'attribute') {
                const { name, displayName, inputType, required, helpTip, allowedConnectionTypes, validation, validationRegEx } = element.value;
                const inputName = parentName ? `${parentName}${name.trim().replace(/\s/g, '_')}` : name.trim().replace(/\s/g, '_');
                const isRequired = required == 'true';

                const validator = `"${inputName}": (e?: any) => validateField("${inputName}", e, ${isRequired} ${validation ? `, "${validation}"` : ""} ${validationRegEx ? `, "${validationRegEx}"` : ""}),\n`;

                if (inputType === 'stringOrExpression' || inputType === 'string') {
                    formValidators += validator;

                    fields +=
                        fixIndentation(`
                        <TextField
                            label="${displayName}"
                            size={50}
                            placeholder="${helpTip}"
                            value={formValues["${inputName}"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "${inputName}": e });
                                formValidators["${inputName}"](e);
                            }}
                            required={${isRequired}}
                        />
                        {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}\n`, indentation);
                } else if (inputType === 'connection') {
                    formValidators += validator;

                    let dropdownStr = '';
                    dropdownStr += `
                    <label>${displayName}</label> ${isRequired ? `<RequiredFormInput />` : ''}
                    <VSCodeDropdown
                        label="${displayName}"
                        value={formValues["${inputName}"]}
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
                    {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}\n`;
                    fields +=
                        fixIndentation(dropdownStr, indentation);
                } else if (inputType === 'comboOrExpression') {
                    formValidators += validator;

                    const comboValues = element.value.comboValues;
                    let comboStr = `
                        <label>${displayName}</label> ${isRequired ? `<RequiredFormInput />` : ''}
                        <AutoComplete items={[${comboValues.map((value: string) => `"${value}"`)}]} selectedItem={formValues["${inputName}"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "${inputName}": e });
                            formValidators["${inputName}"](e);
                        }} />`;
                    fields +=
                        fixIndentation(comboStr, indentation);
                }
            } else if (element.type === 'attributeGroup') {
                fields +=
                    fixIndentation(`
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>   
                        <h3>${element.value.groupName}</h3>\n`, indentation);
                generateFormItems(element.value.elements, indentation + 4, `${element.value.groupName.trim().replace(/\s/g, '_')}.`);
                fields += fixIndentation(`
                </ComponentCard>`, indentation);
            }
        });
    };

    generateFormItems(jsonData.elements, 12);

    componentContent +=
        fixIndentation(
            `
${LICENSE_HEADER}
import React, { useState } from 'react';
import { AutoComplete, Button, ComponentCard, colors, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { create } from 'xmlbuilder2';

const cardStyle = { 
    display: "block", 
    margin: "5px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto" 
};

const Error = styled.span\`
    color: var(--vscode-errorForeground);
    font-size: 12px;
\`;

const emailRegex = /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const ${operationNameCapitalized} = (props: AddMediatorProps) => {
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as any);
    const [errors, setErrors] = useState({} as any);

    const onClick = async () => {
        let newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            const template = create();
            const root = template.ele("${connectorName ? connectorName : ''}${connectorName && operationName ? "." : ""}${operationName ? `${operationName}` : ''}");
            // Fill the values
            Object.keys(formValues).forEach((key) => {
                root.ele(key).txt(formValues[key]);
            });
            const modifiedXml = template.end({ prettyPrint: true, headless: true });
            
            await MIWebViewAPI.getInstance().applyEdit({
                documentUri: props.documentUri, offset: props.nodePosition.start.line, text: modifiedXml
            });
            sidePanelContext.setIsOpen(false);
        }
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {${fixIndentation(formValidators, 16)}
    };

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
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
            delete newErrors[id];
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

export default ${operationNameCapitalized}; \n`, 0);

    return componentContent;
};

const generateForms = () => {
    const s = process.argv.find(arg => arg.startsWith('-s='));
    const d = process.argv.find(arg => arg.startsWith('-d='));

    if (!s || !d) {
        console.error('Please provide source and destination paths');
        return;
    }

    const source = s.split('=')[1];
    const destination = d.split('=')[1];

    const jsonFiles = fs.readdirSync(path.resolve(source));
    jsonFiles.forEach((file) => {
        if (file.endsWith('.json')) {
            const fileContent = fs.readFileSync(path.resolve(source, file), 'utf8');
            const jsonData = JSON.parse(fileContent);
            if (jsonData.operationName) {
                console.log(`Generating form for ${file}`);
                console.log('-----------------------------------');

                const componentContent = generateForm(jsonData);
                // console.log(componentContent);
                fs.writeFileSync(path.resolve(destination, `${jsonData.operationName}.tsx`), componentContent);

                console.log('---------------END-----------------');
            }
        }
    });
}

generateForms();

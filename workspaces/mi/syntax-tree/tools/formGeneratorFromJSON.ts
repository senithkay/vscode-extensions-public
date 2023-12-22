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

function generateEnabledCondition(enableCondition: any, indentation: number) {
    let fields = "";
    let conditionType = "&&";
    let conditions = "";

    if (enableCondition.length > 1) {
        const condition = enableCondition[0];
        if (condition === "OR") {
            conditionType = "||";
        } else if (condition === "NOT") {
            conditionType = "!";
        }
        for (let i = 1; i < enableCondition.length; i++) {
            const conditionElement = enableCondition[i];
            const condition = Object.keys(conditionElement)[0];
            const value = conditionElement[condition];

            if (typeof value === "boolean" || value === "true" || value === "false") {
                conditions += `formValues["${condition}"] == ${Boolean(value)} ${i != enableCondition.length - 1 ? conditionType : ""}`;

            } else {
                conditions += `formValues["${condition}"] && formValues["${condition}"].toLowerCase() == "${value.toLowerCase()}" ${i != enableCondition.length - 1 ? conditionType : ""}`;
            }

        }

        fields +=
            fixIndentation(`
                        {${conditions}&&`, indentation);
    } else {
        const conditionElement = enableCondition[0];
        const condition = Object.keys(conditionElement)[0];
        const value = conditionElement[condition];

        if (typeof value === "boolean" || value === "true" || value === "false") {
            conditions += `formValues["${condition}"] == ${value}`;

        } else {
            conditions += `formValues["${condition}"] && formValues["${condition}"].toLowerCase() == "${value.toLowerCase()}"`;
        }

        fields +=
            fixIndentation(`
                        {${conditions} &&`, indentation);
    }
    return fields;
}

const generateForm = (jsonData: any): string => {
    const operationName = jsonData.name;
    const connectorName = jsonData.connectorName;
    const operationNameCapitalized = `${operationName.split(/[-\s*]/)
        .map((word: string) => capitalizeFirstLetter(word))
        .join('')}Form`;

    let componentContent = '';
    let formValidators = '\n';
    let fields = '';
    let defaultValues = '';

    const generateFormItems = (elements: any[], indentation: number, parentName?: string) => {
        elements.forEach((element, index) => {
            if (element.type === 'attribute') {
                const { name, displayName, defaultValue, enableCondition, inputType, required, helpTip, allowedConnectionTypes, validation, validationRegEx } = element.value;
                // const inputName = parentName ? `${parentName}${name.trim().replace(/\s/g, '_')}` : name.trim().replace(/\s/g, '_');
                const inputName = name.trim().replace(/\s/g, '_');
                const isRequired = required == 'true';

                formValidators += `"${inputName}": (e?: any) => validateField("${inputName}", e, ${isRequired}${validation ? `, "${validation}"` : ""}${validationRegEx ? `, "${validationRegEx}"` : ""}),\n`;

                if (defaultValue) {
                    defaultValues +=
                        fixIndentation(`
                    "${inputName}": ${typeof defaultValue === "boolean" ? Boolean(defaultValue) : `"${defaultValue}"`},`, 8);
                }

                if (enableCondition) {
                    fields += generateEnabledCondition(enableCondition, indentation);
                    indentation += 4;
                }

                fields +=
                    fixIndentation(`
                    <div>`, indentation);
                indentation += 4;
                if (inputType === 'stringOrExpression' || inputType === 'string' || inputType === 'registry') {

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
                        {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}`, indentation);
                } else if (inputType === 'connection') {

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
                    {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}`;
                    fields +=
                        fixIndentation(dropdownStr, indentation);
                } else if (inputType === 'comboOrExpression' || inputType === 'combo') {

                    const comboValues = element.value.comboValues.map((value: string) => `"${value}"`).toString().replaceAll(",", ", ");
                    let comboStr = `
                        <label>${displayName}</label> ${isRequired ? `<RequiredFormInput />` : ''}
                        <AutoComplete items={[${comboValues}]} selectedItem={formValues["${inputName}"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "${inputName}": e });
                            formValidators["${inputName}"](e);
                        }} />
                        {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}`;
                    fields +=
                        fixIndentation(comboStr, indentation);
                } else if (inputType === 'checkbox') {
                    if (!defaultValue) {
                        defaultValues +=
                            fixIndentation(`
                        "${inputName}": false,`, 8);
                    }

                    let checkboxStr = `
                        <VSCodeCheckbox type="checkbox" checked={formValues["${inputName}"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "${inputName}": e.target.checked });
                            formValidators["${inputName}"](e);
                        }
                        }>${displayName} ${isRequired ? `<RequiredFormInput />` : ''}</VSCodeCheckbox>
                        {errors["${inputName}"] && <Error>{errors["${inputName}"]}</Error>}`;

                    fields +=
                        fixIndentation(checkboxStr, indentation);
                }
                indentation -= 4;
                fields +=
                    fixIndentation(`
                    </div>${enableCondition ? `
                }\n` : "\n"}`, indentation);

                indentation -= enableCondition ? 4 : 0;

            } else if (element.type === 'attributeGroup') {
                const enableCondition = element.value.enableCondition;
                if (enableCondition) {
                    fields += generateEnabledCondition(enableCondition, indentation);
                    indentation += 4;
                }
                if (parentName !== "table") {
                    fields += fixIndentation(`
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>   
                        <h3>${element.value.groupName}</h3>\n`, indentation);
                }
                
                generateFormItems(element.value.elements, indentation + 4, `${element.value.groupName.trim().replace(/\s/g, '_')}.`);

                if (parentName !== "table") {
                    fields += fixIndentation(`
                    </ComponentCard>`, indentation);
                }
                
                indentation -= enableCondition ? 4 : 0;
                fields +=
                    fixIndentation(`${enableCondition ? `
                }\n` : "\n"}`, indentation);
            } else if (element.type === 'table') {
                const inputName = element.value.name.trim();
                fields +=
                    fixIndentation(`
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>${element.value.displayName}</h3>\n`, indentation);
                defaultValues +=
                    fixIndentation(`
                    "${inputName}": [] as string[][],`, 8);
                const elements = element.value.form.elements;
                generateFormItems(elements, indentation + 4, "table");
                
                const name = elements[0].value.elements[0].value.name;
                const type = elements[0].value.elements[1].value.name;
                const value = elements[0].value.elements[2] ? elements[0].value.elements[2].value.name : "";

                // Add button
                fields += fixIndentation(`
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <Button appearance="primary" onClick={() => {
                            if (!(validateField("${name}", formValues["${name}"], true) || validateField("${value}", formValues["${value}"], true))) {
                                setFormValues({
                                    ...formValues, "${name}": undefined, "${value}": undefined,
                                    "${inputName}": [...formValues["${inputName}"], [formValues["${name}"], formValues["${type}"], formValues["${value}"]]]
                                });
                            }
                        }}>
                            Add
                        </Button>
                    </div>`, indentation);

                fields += fixIndentation(`
                        {formValues["${inputName}"] && formValues["${inputName}"].length > 0 && (
                            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                                <h3>${element.value.displayName} Table</h3>
                                <VSCodeDataGrid style={{ display: 'flex', flexDirection: 'column' }}>
                                    <VSCodeDataGridRow className="header" style={{ display: 'flex', background: 'gray' }}>
                                        <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                            Name
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                            Value Type
                                        </VSCodeDataGridCell>
                                        <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                            Value
                                        </VSCodeDataGridCell>
                                    </VSCodeDataGridRow>
                                    {formValues["${inputName}"].map((property: string, index: string) => (
                                        <VSCodeDataGridRow key={index} style={{ display: 'flex' }}>
                                            <VSCodeDataGridCell key={0} style={{ flex: 1 }}>
                                                {property[0]}
                                            </VSCodeDataGridCell>
                                            <VSCodeDataGridCell key={1} style={{ flex: 1 }}>
                                                {property[1]}
                                            </VSCodeDataGridCell>
                                            <VSCodeDataGridCell key={2} style={{ flex: 1 }}>
                                                {property[2]}
                                            </VSCodeDataGridCell>
                                        </VSCodeDataGridRow>
                                    ))}
                                </VSCodeDataGrid>
                            </ComponentCard>
                        )}`, indentation);

                fields += fixIndentation(`
                </ComponentCard>`, indentation);
            }
        });
    };

    generateFormItems(jsonData.elements, 12);

    componentContent +=
        fixIndentation(
            `${LICENSE_HEADER}
import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, colors, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../constants';

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
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    useEffect(() => {
        if (sidePanelContext.formValues) {
            setFormValues({ ...formValues, ...sidePanelContext.formValues });
        } else {
            setFormValues({${defaultValues}});
        }
    }, [sidePanelContext.formValues]);

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
            const xml = getXML(MEDIATORS.${operationNameCapitalized.toUpperCase().substring(0, operationNameCapitalized.length - 4)}, formValues);
            MIWebViewAPI.getInstance().applyEdit({
                documentUri: props.documentUri, range: props.nodePosition, text: xml
            });
            sidePanelContext.setIsOpen(false);
            sidePanelContext.setFormValues(undefined);
            sidePanelContext.setNodeRange(undefined);
            sidePanelContext.setMediator(undefined);
        }
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {${fixIndentation(formValidators, 8)}
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
    console.log('Generating forms...');

    const source = s.split('=')[1];
    const destination = d.split('=')[1];

    const getFiles = function (dirPath: string, arrayOfFiles: string[]) {
        const files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getFiles(dirPath + "/" + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });

        return arrayOfFiles;
    };

    const jsonFiles = getFiles(source, []).filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} json files`);

    jsonFiles.forEach((file) => {
        const fileContent = fs.readFileSync(file, 'utf8');
        const jsonData = JSON.parse(fileContent);
        const reltivePath = path.relative(source, file);
        const destinationPath = path.join(destination, reltivePath).replace('.json', '.tsx');

        if (jsonData.name) {
            console.log(`Generating form for ${file}`);
            console.log('-----------------------------------');

            const componentContent = generateForm(jsonData);
            // console.log(componentContent);
            fs.writeFileSync(destinationPath, componentContent);

            console.log('---------------END-----------------');
        }
    });
}

generateForms();

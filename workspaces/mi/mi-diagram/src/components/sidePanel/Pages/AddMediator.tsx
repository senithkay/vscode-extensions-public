/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useState } from 'react';
import { Button, Input, MenuItem, Select } from '@material-ui/core';
import './AddMediator.css';
import { MIWebViewAPI } from '../../../utils/WebViewRpc';
import SidePanelContext from '../SidePanelContexProvider';

export interface AddMediatorProps {
    file: string;
    nodePosition: number;
}

interface IButton {
    name: string;
    parameters: { [key: string]: any };
}

const buttons: IButton[] = [
    {
        name: 'Log',
        parameters: {
            "Log Level": ['INFO', 'DEBUG', 'ERROR', 'WARN'],
            Properties: {
                key1: '',
            },
        },
    },
];

function AddMediator(props: AddMediatorProps) {
    const sidePanelContext = useContext(SidePanelContext)
    const [selectedButton, setSelectedButton] = useState<IButton | null>(null);
    const [fields, setFields] = useState<{ key: string; value: any; selected?: string }[]>([]);
    const [isValidForm, setIsValidForm] = useState<boolean>(false);

    const handleButtonClick = (button: IButton) => {
        setSelectedButton(button);
        setFields(Object.entries(button.parameters).map(([key, value]) => ({ key, value })));
    };

    const handleAddField = (key: any) => {
        const newFields = [...fields];
        const fieldIndex = newFields.findIndex(field => field.key === key);
        if (fieldIndex !== -1) {
            newFields[fieldIndex].value = { ...newFields[fieldIndex].value, [`key${Object.keys(newFields[fieldIndex].value).length + 1}`]: '' };
        }
        setFields(newFields);
    };

    const handleFieldChange = (position: number, key: any, type: 'key' | 'value' | 'selected', value: string) => {
        const newFields = [...fields];
        const keys = key.split('.');
        let currentObject = newFields;
        for (let i = 0; i < keys.length - 1; i++) {
            const index = newFields.findIndex(field => field.key === keys[i]);
            currentObject = newFields[index !== -1 ? index : position].value;
        }

        if (Array.isArray(currentObject)) {
            const index = currentObject.findIndex(field => field.key === keys[keys.length - 1]);
            currentObject[index !== -1 ? index : position][type] = value;

        } else {
            if (type === 'key') {
                const currentKey = Object.keys(currentObject)[position];
                currentObject[value] = currentObject[currentKey];
                delete currentObject[currentKey]

            } else {
                (currentObject[keys[keys.length - 1]] as any) = value;
            }
        }
        setFields(newFields);
        setIsValidForm(validateForm(newFields));
    };

    const validateForm = (fields: any): boolean => {
        for (let i = 0; i < fields.length; i++) {
            if (Array.isArray(fields[i].value)) {
                if (!fields[i].selected) {
                    return false;
                }
            } else if (fields[i].value instanceof Object) {
                return validateForm(fields[i].value);
            }
        }
        return true;
    }

    const handleSubmit = () => {
        if (isValidForm) {
            let string = '';

            const logLevel = fields.find(field => field.key === 'Log Level')?.selected;
            const properties = fields.find(field => field.key === 'Properties')?.value;
            string += `\n<log level=\"${logLevel}\">`;
            if (properties) {
                Object.entries(properties).forEach(([key, value]) => {
                    string += `\n\t<property name=\"${key}\" value=\"${value}\"/>`;
                });
            }
            string += '\n</log>';

            MIWebViewAPI.getInstance().applyEdit({
                offset: props.nodePosition,
                text: string,
                documentUri: props.file
            });
            sidePanelContext.setIsOpen(false);
        }
    };

    function getFieldComponents(fields: { key: string; value: any; selected?: string }[], isKeyEditable = false, parentKey?: string) {
        let fieldComponents: any[] = [];
        fields.forEach((field, index) => {
            const fieldKey = parentKey ? `${parentKey}.${field.key}` : field.key;
            if (typeof field.value === "string") {
                const key = isKeyEditable ? <>
                    <Input
                        placeholder="Value"
                        value={field.key}
                        onChange={(e: any) => handleFieldChange(index, fieldKey, 'key', e.target.value)}
                    />
                </> : <span style={{ margin: "auto 0" }}>{field.key}</span>;
                fieldComponents.push(
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "5px" }}>
                        {key}
                        <Input
                            placeholder="Value"
                            value={field.value}
                            onChange={(e: any) => handleFieldChange(index, fieldKey, 'value', e.target.value)}
                        />
                    </div>)
            } else if (Array.isArray(field.value)) {
                field.selected = field.value[0];
                fieldComponents.push(
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ margin: "auto 0" }}>{field.key}</span>
                        <Select
                            label={field.key}
                            value={field.selected}
                            autoWidth={true}
                            onChange={(e: any) => handleFieldChange(index, fieldKey, 'selected', e.target.value)}
                            style={{ color: 'var(--vscode-editor-foreground)', minWidth: '180px' }}
                        >
                            {field.value.map((value: string) => (
                                <MenuItem value={value} style={{ color: 'var(--vscode-editor-foreground)', background: 'var(--vscode-editor-background)' }}>{value}</MenuItem>
                            ))}
                        </Select>
                    </div>)
            } else {
                fieldComponents.push(
                    <div style={{ margin: "10px 0" }}>
                        <hr style={{ border: "1px solid var(--vscode-editor-foreground)" }}></hr>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ margin: "auto" }}>{field.key}</span>
                            <Button onClick={() => handleAddField(field.key)} style={{ float: "right" }}>+</Button>
                        </div>
                        {getFieldComponents(Object.entries(field.value).map(([key, value]) => ({ key, value })), true, field.key)}
                        <hr style={{ border: "1px solid var(--vscode-editor-foreground)" }}></hr>
                    </div>)
            }
        });
        return fieldComponents;
    }

    return (
        <div className="add-mediator">
            {selectedButton ? (
                <div>
                    <h2>{selectedButton.name}</h2>
                    {getFieldComponents(fields)}
                    <div style={{ textAlign: "right" }}>
                        <Button onClick={handleSubmit} disabled={!isValidForm}>
                            Submit
                        </Button>
                    </div>
                </div>
            ) : (
                buttons.map((button) => (
                    <Button key={button.name} onClick={() => handleButtonClick(button)}>
                        {button.name}
                    </Button>
                ))
            )}
        </div>
    );
};

export default AddMediator;

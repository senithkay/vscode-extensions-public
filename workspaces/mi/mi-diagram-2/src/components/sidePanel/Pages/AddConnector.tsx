/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Button, ComponentCard, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import SidePanelContext from '../SidePanelContexProvider';
// import { create } from 'xmlbuilder2';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

const cardStyle = {
    display: "block",
    margin: "5px 0",
    padding: "10px 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
    color: var(--vscode-errorForeground);
    font-size: 12px;
`;

interface AddConnectorProps {
    formData: any;
    nodePosition: Range;
    documentUri: string;
}

interface Element {
    inputType: any;
    name: string | number;
    displayName: any;
    required: string;
    helpTip: any;
    comboValues?: any[];
    allowedConnectionTypes?: string[];
}

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const AddConnector = (props: AddConnectorProps) => {
    const { rpcClient } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as any);
    const [errors, setErrors] = useState({} as any);

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {};

    const validateField = (id: string, e: any, isRequired: boolean, validation?: "e-mail" | "nameWithoutSpecialCharactors" | "custom", regex?: string): string => {
        const value = e ?? formValues[id];
        const newErrors = { ...errors };
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

    const onClick = async () => {
        const newErrors = {} as any;
        Object.keys(formValidators).forEach((key) => {
            const error = formValidators[key]();
            if (error) {
                newErrors[key] = (error);
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            // const template = create();
            // const root = template.ele(`${props.formData.connectorName}${props.formData.operationName ? `.${props.formData.operationName}` : ''}`);
            // // Fill the values
            // Object.keys(formValues).forEach((key) => {
            //     root.ele(key).txt(formValues[key]);
            // });
            // const modifiedXml = template.end({ prettyPrint: true, headless: true });
            
            // rpcClient.getMiDiagramRpcClient().applyEdit({
            //     documentUri: props.documentUri, range: props.nodePosition, text: modifiedXml
            // });
            sidePanelContext.setIsOpen(false);
        }
    };

    const renderFormElement = (element: Element) => {
        switch (element.inputType) {
            case 'string':
            case 'stringOrExpression':
                return (
                    <TextField
                        label={element.displayName}
                        size={50}
                        value={formValues[element.name] || ''}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e });
                            formValidators[element.name](e);
                        }}
                        required={element.required === 'true'}
                        placeholder={element.helpTip}
                    />
                );
            case 'connection':
                formValues[element.name] = element.allowedConnectionTypes[0];
                return (<>
                    <label>{element.displayName}</label> {element.required && <RequiredFormInput />}
                    <VSCodeDropdown
                        label={element.displayName}
                        value={formValues[element.name]}
                        autoWidth={true}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, [element.name]: e.target.value });
                            formValidators[element.name](e);
                        }}
                        style={{ color: 'var(--vscode-editor-foreground)', width: '100%' }}
                    >
                        {
                            element.allowedConnectionTypes.map((value: string) => (
                                <VSCodeOption
                                    style={{
                                        color: 'var(--vscode-editor-foreground)',
                                        background: 'var(--vscode-editor-background)'
                                    }}>{value}
                                </VSCodeOption>
                            ))
                        }
                    </VSCodeDropdown>
                </>);
            default:
                return null;
        }
    };

    const renderForm: any = (elements: any[]) => {
        return elements.map((element: { type: string; value: any; }) => {
            if (element.type === 'attribute') {
                formValidators[element.value.name] = (e?: any) => validateField(element.value.name, e, element.value.required === 'true', element.value.validation, element.value.regex);
                return <>
                    {renderFormElement(element.value)}
                    {errors[element.value.name] && <Error>{errors[element.value.name]}</Error>}
                </>;
            } else if (element.type === 'attributeGroup') {
                return (
                    <>
                        <h3 style={{ margin: 0 }}>{element.value.groupName}</h3>
                        <ComponentCard sx={cardStyle} disbaleHoverEffect>
                            {renderForm(element.value.elements)}
                        </ComponentCard>
                    </>
                );
            }
            return null;
        });
    };

    return (
        <div style={{ padding: "10px" }}>
            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                {renderForm(props.formData.elements)}
            </ComponentCard>
            <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Button
                    appearance="primary"
                    onClick={onClick}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
};

export default AddConnector;

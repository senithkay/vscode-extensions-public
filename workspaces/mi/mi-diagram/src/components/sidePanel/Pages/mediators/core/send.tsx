
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useState } from 'react';
import { AutoComplete, Button, ComponentCard, colors, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { create } from 'xmlbuilder2';
import { Position } from 'vscode';

const cardStyle = { 
    display: "block",
    margin: "5px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

const Error = styled.span`
    color: var(--vscode-errorForeground);
    font-size: 12px;
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const SendForm = (props: AddMediatorProps) => {
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({
        "skipSerialization": false,
        "buildMessageBeforeSending": false,
        "receivingSequenceType": "Default",
    } as { [key: string]: any });
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
            const root = template.ele("send");
            // Fill the values
            Object.keys(formValues).forEach((key) => {
                root.att(key, formValues[key]);
            });
            const modifiedXml = template.end({ prettyPrint: true, headless: true });
            
            await MIWebViewAPI.getInstance().applyEdit({
                documentUri: props.documentUri, position: props.nodePosition.start as Position, text: modifiedXml
            });
            sidePanelContext.setIsOpen(false);
        }
    };

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "skipSerialization": (e?: any) => validateField("skipSerialization", e, false),
        "buildMessageBeforeSending": (e?: any) => validateField("buildMessageBeforeSending", e, false),
        "receivingSequenceType": (e?: any) => validateField("receivingSequenceType", e, false),
        "staticReceivingSequence": (e?: any) => validateField("staticReceivingSequence", e, false),
        "dynamicReceivingSequence": (e?: any) => validateField("dynamicReceivingSequence", e, false),
        "description": (e?: any) => validateField("description", e, false),

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
        <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                <div>
                    <VSCodeCheckbox type="checkbox" checked={formValues["skipSerialization"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "skipSerialization": e.target.checked });
                        formValidators["skipSerialization"](e);
                    }
                    }>Skip Serialization </VSCodeCheckbox>
                    {errors["skipSerialization"] && <Error>{errors["skipSerialization"]}</Error>}
                </div>

                {formValues["skipSerialization"] == true &&
                    <div>
                        <VSCodeCheckbox type="checkbox" checked={formValues["buildMessageBeforeSending"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "buildMessageBeforeSending": e.target.checked });
                            formValidators["buildMessageBeforeSending"](e);
                        }
                        }>Build Message Before Sending </VSCodeCheckbox>
                        {errors["buildMessageBeforeSending"] && <Error>{errors["buildMessageBeforeSending"]}</Error>}
                    </div>
                }

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Receiving Sequence</h3>

                    <div>
                        <label>Receiving Sequence Type</label>
                        <AutoComplete items={["Default", "Static", "Dynamic"]} selectedItem={formValues["receivingSequenceType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "receivingSequenceType": e });
                            formValidators["receivingSequenceType"](e);
                        }} />
                        {errors["receivingSequenceType"] && <Error>{errors["receivingSequenceType"]}</Error>}
                    </div>

                    {formValues["receivingSequenceType"] && formValues["receivingSequenceType"].toLowerCase() == "static" &&
                        <div>
                            <TextField
                                label="Static Receiving Sequence"
                                size={50}
                                placeholder=""
                                value={formValues["staticReceivingSequence"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "staticReceivingSequence": e });
                                    formValidators["staticReceivingSequence"](e);
                                }}
                                required={false}
                            />
                            {errors["staticReceivingSequence"] && <Error>{errors["staticReceivingSequence"]}</Error>}
                        </div>
                    }

                    {formValues["receivingSequenceType"] && formValues["receivingSequenceType"].toLowerCase() == "dynamic" &&
                        <div>
                            <TextField
                                label="Dynamic Receiving Sequence"
                                size={50}
                                placeholder=""
                                value={formValues["dynamicReceivingSequence"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "dynamicReceivingSequence": e });
                                    formValidators["dynamicReceivingSequence"](e);
                                }}
                                required={false}
                            />
                            {errors["dynamicReceivingSequence"] && <Error>{errors["dynamicReceivingSequence"]}</Error>}
                        </div>
                    }

                </ComponentCard>
                {formValues["receivingSequenceType"] && formValues["receivingSequenceType"].toLowerCase() == "default" &&
                    <div>
                        <TextField
                            label="Description"
                            size={50}
                            placeholder=""
                            value={formValues["description"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "description": e });
                                formValidators["description"](e);
                            }}
                            required={false}
                        />
                        {errors["description"] && <Error>{errors["description"]}</Error>}
                    </div>
                }

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

export default SendForm; 

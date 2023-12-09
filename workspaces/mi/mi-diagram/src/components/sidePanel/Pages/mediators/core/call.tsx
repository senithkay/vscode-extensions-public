
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

const CallForm = (props: AddMediatorProps) => {
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({
        "enableBlockingCalls": false,
        "initAxis2ClientOptions": false,
        "endpointType": "INLINE",
        "sourceType": "none",
        "targetType": "body",
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
            const root = template.ele("call");
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
        "enableBlockingCalls": (e?: any) => validateField("enableBlockingCalls", e, false),
        "initAxis2ClientOptions": (e?: any) => validateField("initAxis2ClientOptions", e, false),
        "endpointType": (e?: any) => validateField("endpointType", e, false),
        "endpointRegistryKey": (e?: any) => validateField("endpointRegistryKey", e, false),
        "endpointXpath": (e?: any) => validateField("endpointXpath", e, false),
        "sourceType": (e?: any) => validateField("sourceType", e, false),
        "sourceProperty": (e?: any) => validateField("sourceProperty", e, false),
        "contentType": (e?: any) => validateField("contentType", e, false),
        "sourcePayload": (e?: any) => validateField("sourcePayload", e, false),
        "sourceXPath": (e?: any) => validateField("sourceXPath", e, false),
        "targetType": (e?: any) => validateField("targetType", e, false),
        "targetProperty": (e?: any) => validateField("targetProperty", e, false),
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
                    <VSCodeCheckbox type="checkbox" checked={formValues["enableBlockingCalls"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "enableBlockingCalls": e.target.checked });
                        formValidators["enableBlockingCalls"](e);
                    }
                    }>Enable Blocking Calls </VSCodeCheckbox>
                    {errors["enableBlockingCalls"] && <Error>{errors["enableBlockingCalls"]}</Error>}
                </div>

                <div>
                    <VSCodeCheckbox type="checkbox" checked={formValues["initAxis2ClientOptions"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "initAxis2ClientOptions": e.target.checked });
                        formValidators["initAxis2ClientOptions"](e);
                    }
                    }>Initialize Axis2 Client Options </VSCodeCheckbox>
                    {errors["initAxis2ClientOptions"] && <Error>{errors["initAxis2ClientOptions"]}</Error>}
                </div>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>EndpointType</h3>

                    <div>
                        <label>Endpoint Type</label>
                        <AutoComplete items={["INLINE", "NONE", "REGISTRYKEY", "XPATH"]} selectedItem={formValues["endpointType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "endpointType": e });
                            formValidators["endpointType"](e);
                        }} />
                        {errors["endpointType"] && <Error>{errors["endpointType"]}</Error>}
                    </div>

                    {formValues["payload"] && formValues["payload"].toLowerCase() == "REGISTRYKEY" &&
                        <div>
                        </div>
                    }

                    {formValues["payload"] && formValues["payload"].toLowerCase() == "XPATH" &&
                        <div>
                            <TextField
                                label="Endpoint Xpath"
                                size={50}
                                placeholder="Endpoint Xpath"
                                value={formValues["endpointXpath"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "endpointXpath": e });
                                    formValidators["endpointXpath"](e);
                                }}
                                required={false}
                            />
                            {errors["endpointXpath"] && <Error>{errors["endpointXpath"]}</Error>}
                        </div>
                    }

                </ComponentCard>
                <div>
                    <label>Source Type</label>
                    <AutoComplete items={["none", "body", "property", "inline", "custom"]} selectedItem={formValues["sourceType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "sourceType": e });
                        formValidators["sourceType"](e);
                    }} />
                    {errors["sourceType"] && <Error>{errors["sourceType"]}</Error>}
                </div>

                {formValues["payload"] && formValues["payload"].toLowerCase() == "property" &&
                    <div>
                        <TextField
                            label="Source Property"
                            size={50}
                            placeholder="Source Property"
                            value={formValues["sourceProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sourceProperty": e });
                                formValidators["sourceProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["sourceProperty"] && <Error>{errors["sourceProperty"]}</Error>}
                    </div>
                }

                {formValues["0"] && formValues["0"].toLowerCase() == "O" &&formValues["payload"] && formValues["payload"].toLowerCase() == "property" &&formValues["payload"] && formValues["payload"].toLowerCase() == "inline" &&formValues["payload"] && formValues["payload"].toLowerCase() == "custom" &&
                    <div>
                        <TextField
                            label="Content Type"
                            size={50}
                            placeholder="Content Type"
                            value={formValues["contentType"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "contentType": e });
                                formValidators["contentType"](e);
                            }}
                            required={false}
                        />
                        {errors["contentType"] && <Error>{errors["contentType"]}</Error>}
                    </div>
                }

                {formValues["payload"] && formValues["payload"].toLowerCase() == "inline" &&
                    <div>
                        <TextField
                            label="Source Payload"
                            size={50}
                            placeholder="Source Payload"
                            value={formValues["sourcePayload"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sourcePayload": e });
                                formValidators["sourcePayload"](e);
                            }}
                            required={false}
                        />
                        {errors["sourcePayload"] && <Error>{errors["sourcePayload"]}</Error>}
                    </div>
                }

                <div>
                    <TextField
                        label="Source XPath"
                        size={50}
                        placeholder="Source XPath"
                        value={formValues["sourceXPath"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "sourceXPath": e });
                            formValidators["sourceXPath"](e);
                        }}
                        required={false}
                    />
                    {errors["sourceXPath"] && <Error>{errors["sourceXPath"]}</Error>}
                </div>

                <div>
                    <label>Target Type</label>
                    <AutoComplete items={["body", "property"]} selectedItem={formValues["targetType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "targetType": e });
                        formValidators["targetType"](e);
                    }} />
                    {errors["targetType"] && <Error>{errors["targetType"]}</Error>}
                </div>

                {formValues["payload"] && formValues["payload"].toLowerCase() == "property" &&
                    <div>
                        <TextField
                            label="Target Property"
                            size={50}
                            placeholder="Target Property"
                            value={formValues["targetProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "targetProperty": e });
                                formValidators["targetProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["targetProperty"] && <Error>{errors["targetProperty"]}</Error>}
                    </div>
                }

                <div>
                    <TextField
                        label="Description"
                        size={50}
                        placeholder="Description"
                        value={formValues["description"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e });
                            formValidators["description"](e);
                        }}
                        required={false}
                    />
                    {errors["description"] && <Error>{errors["description"]}</Error>}
                </div>

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

export default CallForm; 

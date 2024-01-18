/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../../mediators/common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { ENDPOINTS } from '../../../../../constants';

const cardStyle = { 
   display: "block",
   margin: "15px 0",
   padding: "0 15px 15px 15px",
   width: "auto",
   cursor: "auto"
};

const Error = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

const Field = styled.div`
   margin-bottom: 12px;
`;

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
const nameWithoutSpecialCharactorsRegex = /^[a-zA-Z0-9]+$/g;

const WSDLEndpointForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "inline": false,
       "format": "LEAVE_AS_IS",
       "statisticsEnabled": false,
       "traceEnabled": false,
       "reliableMessagingEnabled": false,
       "securityEnabled": false,
       "addressingEnabled": false,
       "timeoutAction": "never",
       "optimize": "LEAVE_AS_IS",
       "proeprties": [] as string[][],
       "scope": "default",
       "valueType": "LITERAL",});
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
           const xml = getXML(ENDPOINTS.WSDLENDPOINT, formValues);
           MIWebViewAPI.getInstance().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setMediator(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "inline": (e?: any) => validateField("inline", e, false),
       "format": (e?: any) => validateField("format", e, false),
       "statisticsEnabled": (e?: any) => validateField("statisticsEnabled", e, false),
       "traceEnabled": (e?: any) => validateField("traceEnabled", e, false),
       "suspendErrorCodes": (e?: any) => validateField("suspendErrorCodes", e, false),
       "suspendInitialDuration": (e?: any) => validateField("suspendInitialDuration", e, false),
       "suspendMaximumDuration": (e?: any) => validateField("suspendMaximumDuration", e, false),
       "suspendProgressionFactor": (e?: any) => validateField("suspendProgressionFactor", e, false),
       "retryErrorCodes": (e?: any) => validateField("retryErrorCodes", e, false),
       "retryCount": (e?: any) => validateField("retryCount", e, false),
       "retryDelay": (e?: any) => validateField("retryDelay", e, false),
       "reliableMessagingEnabled": (e?: any) => validateField("reliableMessagingEnabled", e, false),
       "securityEnabled": (e?: any) => validateField("securityEnabled", e, false),
       "addressingEnabled": (e?: any) => validateField("addressingEnabled", e, false),
       "timeoutDuration": (e?: any) => validateField("timeoutDuration", e, false),
       "timeoutAction": (e?: any) => validateField("timeoutAction", e, false),
       "optimize": (e?: any) => validateField("optimize", e, false),
       "wsdlUri": (e?: any) => validateField("wsdlUri", e, false),
       "service": (e?: any) => validateField("service", e, false),
       "port": (e?: any) => validateField("port", e, false),
       "failoverNonRetryErrorCodes": (e?: any) => validateField("failoverNonRetryErrorCodes", e, false),
       "name": (e?: any) => validateField("name", e, false),
       "scope": (e?: any) => validateField("scope", e, false),
       "valueType": (e?: any) => validateField("valueType", e, false),
       "value": (e?: any) => validateField("value", e, false),
       "valueExpression": (e?: any) => validateField("valueExpression", e, false),
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
                <h3>Basic</h3>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["inline"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "inline": e.target.checked });
                        formValidators["inline"](e);
                    }
                    }>Inline </VSCodeCheckbox>
                    {errors["inline"] && <Error>{errors["inline"]}</Error>}
                </Field>

                <Field>
                    <label>Format</label>
                    <AutoComplete items={["LEAVE_AS_IS", "soap11", "soap12", "pox", "get", "rest"]} selectedItem={formValues["format"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "format": e });
                        formValidators["format"](e);
                    }} />
                    {errors["format"] && <Error>{errors["format"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["statisticsEnabled"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "statisticsEnabled": e.target.checked });
                        formValidators["statisticsEnabled"](e);
                    }
                    }>Statistics Enabled </VSCodeCheckbox>
                    {errors["statisticsEnabled"] && <Error>{errors["statisticsEnabled"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["traceEnabled"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "traceEnabled": e.target.checked });
                        formValidators["traceEnabled"](e);
                    }
                    }>Trace Enabled </VSCodeCheckbox>
                    {errors["traceEnabled"] && <Error>{errors["traceEnabled"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Advanced</h3>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Endpoint Suspend State</h3>

                    <Field>
                        <TextField
                            label="Suspend Error Codes"
                            size={50}
                            placeholder=""
                            value={formValues["suspendErrorCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendErrorCodes": e });
                                formValidators["suspendErrorCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendErrorCodes"] && <Error>{errors["suspendErrorCodes"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Initial Duration"
                            size={50}
                            placeholder=""
                            value={formValues["suspendInitialDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendInitialDuration": e });
                                formValidators["suspendInitialDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendInitialDuration"] && <Error>{errors["suspendInitialDuration"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Maximum Duration"
                            size={50}
                            placeholder=""
                            value={formValues["suspendMaximumDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendMaximumDuration": e });
                                formValidators["suspendMaximumDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendMaximumDuration"] && <Error>{errors["suspendMaximumDuration"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Suspend Progression Factor"
                            size={50}
                            placeholder=""
                            value={formValues["suspendProgressionFactor"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "suspendProgressionFactor": e });
                                formValidators["suspendProgressionFactor"](e);
                            }}
                            required={false}
                        />
                        {errors["suspendProgressionFactor"] && <Error>{errors["suspendProgressionFactor"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Endpoint Timeout State</h3>

                    <Field>
                        <TextField
                            label="Retry Error Codes"
                            size={50}
                            placeholder=""
                            value={formValues["retryErrorCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryErrorCodes": e });
                                formValidators["retryErrorCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["retryErrorCodes"] && <Error>{errors["retryErrorCodes"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Retry Count"
                            size={50}
                            placeholder=""
                            value={formValues["retryCount"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryCount": e });
                                formValidators["retryCount"](e);
                            }}
                            required={false}
                        />
                        {errors["retryCount"] && <Error>{errors["retryCount"]}</Error>}
                    </Field>

                    <Field>
                        <TextField
                            label="Retry Delay"
                            size={50}
                            placeholder=""
                            value={formValues["retryDelay"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "retryDelay": e });
                                formValidators["retryDelay"](e);
                            }}
                            required={false}
                        />
                        {errors["retryDelay"] && <Error>{errors["retryDelay"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>QoS</h3>

                    <Field>
                        <VSCodeCheckbox type="checkbox" checked={formValues["reliableMessagingEnabled"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "reliableMessagingEnabled": e.target.checked });
                            formValidators["reliableMessagingEnabled"](e);
                        }
                        }>Reliable Messaging Enabled </VSCodeCheckbox>
                        {errors["reliableMessagingEnabled"] && <Error>{errors["reliableMessagingEnabled"]}</Error>}
                    </Field>

                    <Field>
                        <VSCodeCheckbox type="checkbox" checked={formValues["securityEnabled"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "securityEnabled": e.target.checked });
                            formValidators["securityEnabled"](e);
                        }
                        }>Security Enabled </VSCodeCheckbox>
                        {errors["securityEnabled"] && <Error>{errors["securityEnabled"]}</Error>}
                    </Field>

                    <Field>
                        <VSCodeCheckbox type="checkbox" checked={formValues["addressingEnabled"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "addressingEnabled": e.target.checked });
                            formValidators["addressingEnabled"](e);
                        }
                        }>Addressing Enabled </VSCodeCheckbox>
                        {errors["addressingEnabled"] && <Error>{errors["addressingEnabled"]}</Error>}
                    </Field>

                </ComponentCard>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Timeout</h3>

                    <Field>
                        <TextField
                            label="Timeout Duration"
                            size={50}
                            placeholder=""
                            value={formValues["timeoutDuration"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "timeoutDuration": e });
                                formValidators["timeoutDuration"](e);
                            }}
                            required={false}
                        />
                        {errors["timeoutDuration"] && <Error>{errors["timeoutDuration"]}</Error>}
                    </Field>

                    <Field>
                        <label>Timeout Action</label>
                        <AutoComplete items={["never", "discard", "fault"]} selectedItem={formValues["timeoutAction"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "timeoutAction": e });
                            formValidators["timeoutAction"](e);
                        }} />
                        {errors["timeoutAction"] && <Error>{errors["timeoutAction"]}</Error>}
                    </Field>

                </ComponentCard>

                <Field>
                    <label>Optimize</label>
                    <AutoComplete items={["LEAVE_AS_IS", "mtom", "swa"]} selectedItem={formValues["optimize"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "optimize": e });
                        formValidators["optimize"](e);
                    }} />
                    {errors["optimize"] && <Error>{errors["optimize"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="WSDL URI"
                        size={50}
                        placeholder=""
                        value={formValues["wsdlUri"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "wsdlUri": e });
                            formValidators["wsdlUri"](e);
                        }}
                        required={false}
                    />
                    {errors["wsdlUri"] && <Error>{errors["wsdlUri"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Service"
                        size={50}
                        placeholder=""
                        value={formValues["service"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "service": e });
                            formValidators["service"](e);
                        }}
                        required={false}
                    />
                    {errors["service"] && <Error>{errors["service"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Port"
                        size={50}
                        placeholder=""
                        value={formValues["port"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "port": e });
                            formValidators["port"](e);
                        }}
                        required={false}
                    />
                    {errors["port"] && <Error>{errors["port"]}</Error>}
                </Field>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Failover Error Codes</h3>

                    {formValues["failoverRetryType"] && formValues["failoverRetryType"].toLowerCase() == "non_retry_error_codes" &&
                        <Field>
                            <TextField
                                label="Failover Non Retry Error Codes"
                                size={50}
                                placeholder=""
                                value={formValues["failoverNonRetryErrorCodes"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "failoverNonRetryErrorCodes": e });
                                    formValidators["failoverNonRetryErrorCodes"](e);
                                }}
                                required={false}
                            />
                            {errors["failoverNonRetryErrorCodes"] && <Error>{errors["failoverNonRetryErrorCodes"]}</Error>}
                        </Field>
                    }

                </ComponentCard>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Misc</h3>

                <ComponentCard sx={cardStyle} disbaleHoverEffect>
                    <h3>Properties</h3>

                        <Field>
                            <TextField
                                label="Name"
                                size={50}
                                placeholder=""
                                value={formValues["name"]}
                                onChange={(e: any) => {
                                    setFormValues({ ...formValues, "name": e });
                                    formValidators["name"](e);
                                }}
                                required={false}
                            />
                            {errors["name"] && <Error>{errors["name"]}</Error>}
                        </Field>

                        <Field>
                            <label>Scope</label>
                            <AutoComplete items={["default", "transport", "axis2", "axis2-client"]} selectedItem={formValues["scope"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "scope": e });
                                formValidators["scope"](e);
                            }} />
                            {errors["scope"] && <Error>{errors["scope"]}</Error>}
                        </Field>

                        <Field>
                            <label>Value Type</label>
                            <AutoComplete items={["LITERAL", "EXPRESSION"]} selectedItem={formValues["valueType"]} onChange={(e: any) => {
                                setFormValues({ ...formValues, "valueType": e });
                                formValidators["valueType"](e);
                            }} />
                            {errors["valueType"] && <Error>{errors["valueType"]}</Error>}
                        </Field>

                        {formValues["valueType"] && formValues["valueType"].toLowerCase() == "literal" &&
                            <Field>
                                <TextField
                                    label="Value"
                                    size={50}
                                    placeholder=""
                                    value={formValues["value"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "value": e });
                                        formValidators["value"](e);
                                    }}
                                    required={false}
                                />
                                {errors["value"] && <Error>{errors["value"]}</Error>}
                            </Field>
                        }

                        {formValues["valueType"] && formValues["valueType"].toLowerCase() == "expression" &&
                            <Field>
                                <TextField
                                    label="Value Expression"
                                    size={50}
                                    placeholder=""
                                    value={formValues["valueExpression"]}
                                    onChange={(e: any) => {
                                        setFormValues({ ...formValues, "valueExpression": e });
                                        formValidators["valueExpression"](e);
                                    }}
                                    required={false}
                                />
                                {errors["valueExpression"] && <Error>{errors["valueExpression"]}</Error>}
                            </Field>
                        }


                <div style={{ textAlign: "right", marginTop: "10px" }}>
                    <Button appearance="primary" onClick={() => {
                        if (!(validateField("name", formValues["name"], true) || validateField("valueType", formValues["valueType"], true))) {
                            setFormValues({
                                ...formValues, "name": undefined, "valueType": undefined,
                                "proeprties": [...formValues["proeprties"], [formValues["name"], formValues["scope"], formValues["valueType"]]]
                            });
                        }
                    }}>
                        Add
                    </Button>
                </div>
                {formValues["proeprties"] && formValues["proeprties"].length > 0 && (
                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Properties Table</h3>
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
                            {formValues["proeprties"].map((property: string, index: string) => (
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
                )}
                </ComponentCard>
                <Field>
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
                </Field>

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

export default WSDLEndpointForm; 

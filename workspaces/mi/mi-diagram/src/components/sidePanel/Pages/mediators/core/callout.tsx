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
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { MIWebViewAPI } from '../../../../../utils/WebViewRpc';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../constants';

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

const CalloutForm = (props: AddMediatorProps) => {
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "initAxis2ClientOptions": false,
       "payloadType": "XPATH",
       "resultType": "XPATH",
       "securityType": "TRUE",
       "policies": "TRUE",});
       }
   }, [sidePanelContext.formValues]);

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
           const xml = getXML(MEDIATORS.CALLOUT, formValues);
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
       "endpointType": (e?: any) => validateField("endpointType", e, false),
       "soapAction": (e?: any) => validateField("soapAction", e, false),
       "pathToAxis2Repository": (e?: any) => validateField("pathToAxis2Repository", e, false),
       "pathToAxis2xml": (e?: any) => validateField("pathToAxis2xml", e, false),
       "initAxis2ClientOptions": (e?: any) => validateField("initAxis2ClientOptions", e, false),
       "serviceURL": (e?: any) => validateField("serviceURL", e, false),
       "addressEndpoint": (e?: any) => validateField("addressEndpoint", e, false),
       "payloadType": (e?: any) => validateField("payloadType", e, false),
       "payloadMessageXPath": (e?: any) => validateField("payloadMessageXPath", e, false),
       "payloadProperty": (e?: any) => validateField("payloadProperty", e, false),
       "resultType": (e?: any) => validateField("resultType", e, false),
       "resultMessageXPath": (e?: any) => validateField("resultMessageXPath", e, false),
       "resultContextProperty": (e?: any) => validateField("resultContextProperty", e, false),
       "securityType": (e?: any) => validateField("securityType", e, false),
       "policies": (e?: any) => validateField("policies", e, false),
       "policyKey": (e?: any) => validateField("policyKey", e, false),
       "outboundPolicyKey": (e?: any) => validateField("outboundPolicyKey", e, false),
       "inboundPolicyKey": (e?: any) => validateField("inboundPolicyKey", e, false),
       "description": (e?: any) => validateField("description", e, false),

   };

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

   return (
       <div style={{ padding: "10px" }}>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Service</h3>

                <Field>
                    <label>Endpoint Type</label>
                    <AutoComplete items={["URL", "AddressEndpoint"]} selectedItem={formValues["endpointType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "endpointType": e });
                        formValidators["endpointType"](e);
                    }} />
                    {errors["endpointType"] && <Error>{errors["endpointType"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="SOAP Action"
                        size={50}
                        placeholder=""
                        value={formValues["soapAction"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "soapAction": e });
                            formValidators["soapAction"](e);
                        }}
                        required={false}
                    />
                    {errors["soapAction"] && <Error>{errors["soapAction"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Path To Axis2 Repository"
                        size={50}
                        placeholder=""
                        value={formValues["pathToAxis2Repository"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "pathToAxis2Repository": e });
                            formValidators["pathToAxis2Repository"](e);
                        }}
                        required={false}
                    />
                    {errors["pathToAxis2Repository"] && <Error>{errors["pathToAxis2Repository"]}</Error>}
                </Field>

                <Field>
                    <TextField
                        label="Path To Axis2xml"
                        size={50}
                        placeholder=""
                        value={formValues["pathToAxis2xml"]}
                        onChange={(e: any) => {
                            setFormValues({ ...formValues, "pathToAxis2xml": e });
                            formValidators["pathToAxis2xml"](e);
                        }}
                        required={false}
                    />
                    {errors["pathToAxis2xml"] && <Error>{errors["pathToAxis2xml"]}</Error>}
                </Field>

                <Field>
                    <VSCodeCheckbox type="checkbox" checked={formValues["initAxis2ClientOptions"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "initAxis2ClientOptions": e.target.checked });
                        formValidators["initAxis2ClientOptions"](e);
                    }
                    }>Init Axis2 Client Options </VSCodeCheckbox>
                    {errors["initAxis2ClientOptions"] && <Error>{errors["initAxis2ClientOptions"]}</Error>}
                </Field>

                {formValues["endpointType"] && formValues["endpointType"].toLowerCase() == "url" &&
                    <Field>
                        <TextField
                            label="Service URL"
                            size={50}
                            placeholder=""
                            value={formValues["serviceURL"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "serviceURL": e });
                                formValidators["serviceURL"](e);
                            }}
                            required={false}
                        />
                        {errors["serviceURL"] && <Error>{errors["serviceURL"]}</Error>}
                    </Field>
                }

                {formValues["endpointType"] && formValues["endpointType"].toLowerCase() == "addressendpoint" &&
                    <Field>
                        <TextField
                            label="Address Endpoint"
                            size={50}
                            placeholder=""
                            value={formValues["addressEndpoint"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "addressEndpoint": e });
                                formValidators["addressEndpoint"](e);
                            }}
                            required={false}
                        />
                        {errors["addressEndpoint"] && <Error>{errors["addressEndpoint"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Source</h3>

                <Field>
                    <label>Payload Type</label>
                    <AutoComplete items={["XPATH", "PROPERTY", "ENVELOPE"]} selectedItem={formValues["payloadType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "payloadType": e });
                        formValidators["payloadType"](e);
                    }} />
                    {errors["payloadType"] && <Error>{errors["payloadType"]}</Error>}
                </Field>

                {formValues["payloadType"] && formValues["payloadType"].toLowerCase() == "xpath" &&
                    <Field>
                        <TextField
                            label="Payload Message XPath"
                            size={50}
                            placeholder=""
                            value={formValues["payloadMessageXPath"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "payloadMessageXPath": e });
                                formValidators["payloadMessageXPath"](e);
                            }}
                            required={false}
                        />
                        {errors["payloadMessageXPath"] && <Error>{errors["payloadMessageXPath"]}</Error>}
                    </Field>
                }

                {formValues["payloadType"] && formValues["payloadType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Payload Property"
                            size={50}
                            placeholder=""
                            value={formValues["payloadProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "payloadProperty": e });
                                formValidators["payloadProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["payloadProperty"] && <Error>{errors["payloadProperty"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Target</h3>

                <Field>
                    <label>Result Type</label>
                    <AutoComplete items={["XPATH", "PROPERTY"]} selectedItem={formValues["resultType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "resultType": e });
                        formValidators["resultType"](e);
                    }} />
                    {errors["resultType"] && <Error>{errors["resultType"]}</Error>}
                </Field>

                {formValues["resultType"] && formValues["resultType"].toLowerCase() == "xpath" &&
                    <Field>
                        <TextField
                            label="Result Message XPath"
                            size={50}
                            placeholder=""
                            value={formValues["resultMessageXPath"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "resultMessageXPath": e });
                                formValidators["resultMessageXPath"](e);
                            }}
                            required={false}
                        />
                        {errors["resultMessageXPath"] && <Error>{errors["resultMessageXPath"]}</Error>}
                    </Field>
                }

                {formValues["resultType"] && formValues["resultType"].toLowerCase() == "property" &&
                    <Field>
                        <TextField
                            label="Result Context Property"
                            size={50}
                            placeholder=""
                            value={formValues["resultContextProperty"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "resultContextProperty": e });
                                formValidators["resultContextProperty"](e);
                            }}
                            required={false}
                        />
                        {errors["resultContextProperty"] && <Error>{errors["resultContextProperty"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>WS</h3>

                <Field>
                    <label>Security Type</label>
                    <AutoComplete items={["TRUE", "FALSE"]} selectedItem={formValues["securityType"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "securityType": e });
                        formValidators["securityType"](e);
                    }} />
                    {errors["securityType"] && <Error>{errors["securityType"]}</Error>}
                </Field>

                {formValues["securityType"] && formValues["securityType"].toLowerCase() == "true" &&
                    <Field>
                        <label>Policies</label>
                        <AutoComplete items={["TRUE", "FALSE"]} selectedItem={formValues["policies"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "policies": e });
                            formValidators["policies"](e);
                        }} />
                        {errors["policies"] && <Error>{errors["policies"]}</Error>}
                    </Field>
                }

                {formValues["securityType"] && formValues["securityType"].toLowerCase() == "true" &&formValues["policies"] && formValues["policies"].toLowerCase() == "false" &&
                    <Field>
                        <TextField
                            label="Policy Key"
                            size={50}
                            placeholder=""
                            value={formValues["policyKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "policyKey": e });
                                formValidators["policyKey"](e);
                            }}
                            required={false}
                        />
                        {errors["policyKey"] && <Error>{errors["policyKey"]}</Error>}
                    </Field>
                }

                {formValues["securityType"] && formValues["securityType"].toLowerCase() == "true" &&formValues["policies"] && formValues["policies"].toLowerCase() == "true" &&
                    <Field>
                        <TextField
                            label="Outbound Policy Key"
                            size={50}
                            placeholder=""
                            value={formValues["outboundPolicyKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "outboundPolicyKey": e });
                                formValidators["outboundPolicyKey"](e);
                            }}
                            required={false}
                        />
                        {errors["outboundPolicyKey"] && <Error>{errors["outboundPolicyKey"]}</Error>}
                    </Field>
                }

                {formValues["securityType"] && formValues["securityType"].toLowerCase() == "true" &&formValues["policies"] && formValues["policies"].toLowerCase() == "true" &&
                    <Field>
                        <TextField
                            label="Inbound Policy Key"
                            size={50}
                            placeholder=""
                            value={formValues["inboundPolicyKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "inboundPolicyKey": e });
                                formValidators["inboundPolicyKey"](e);
                            }}
                            required={false}
                        />
                        {errors["inboundPolicyKey"] && <Error>{errors["inboundPolicyKey"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Misc</h3>

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

export default CalloutForm; 

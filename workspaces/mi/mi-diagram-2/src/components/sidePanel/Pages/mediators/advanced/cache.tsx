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
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';

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

const CacheForm = (props: AddMediatorProps) => {
   const { rpcClient } = useVisualizerContext();
   const sidePanelContext = React.useContext(SidePanelContext);
   const [formValues, setFormValues] = useState({} as { [key: string]: any });
   const [errors, setErrors] = useState({} as any);

   useEffect(() => {
       if (sidePanelContext.formValues) {
           setFormValues({ ...formValues, ...sidePanelContext.formValues });
       } else {
           setFormValues({
       "cacheMediatorImplementation": "Default",
       "cacheType": "FINDER",
       "cacheTimeout": "120",
       "maxMessageSize": "2000",
       "scope": "Per_Host",
       "maxEntryCount": "1000",
       "implementationType": "memory",
       "sequenceType": "ANONYMOUS",
       "sequenceKey": "registry",
       "cacheProtocolType": "HTTP",
       "cacheProtocolMethods": "*",
       "responseCodes": ".*",
       "enableCacheControl": false,
       "includeAgeHeader": false,
       "hashGenerator": "org.wso2.carbon.mediator.cache.digest.HttpRequestHashGenerator",});
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
           const xml = getXML(MEDIATORS.CACHE, formValues);
            rpcClient.getMiDiagramRpcClient().applyEdit({
               documentUri: props.documentUri, range: props.nodePosition, text: xml
           });
           sidePanelContext.setIsOpen(false);
           sidePanelContext.setFormValues(undefined);
           sidePanelContext.setNodeRange(undefined);
           sidePanelContext.setOperationName(undefined);
       }
   };

   const formValidators: { [key: string]: (e?: any) => string | undefined } = {
       "cacheMediatorImplementation": (e?: any) => validateField("cacheMediatorImplementation", e, false),
       "cacheType": (e?: any) => validateField("cacheType", e, false),
       "id": (e?: any) => validateField("id", e, false),
       "cacheTimeout": (e?: any) => validateField("cacheTimeout", e, false),
       "maxMessageSize": (e?: any) => validateField("maxMessageSize", e, false),
       "scope": (e?: any) => validateField("scope", e, false),
       "hashGeneratorAttribute": (e?: any) => validateField("hashGeneratorAttribute", e, false),
       "maxEntryCount": (e?: any) => validateField("maxEntryCount", e, false),
       "implementationType": (e?: any) => validateField("implementationType", e, false),
       "sequenceType": (e?: any) => validateField("sequenceType", e, false),
       "sequenceKey": (e?: any) => validateField("sequenceKey", e, false),
       "cacheProtocolType": (e?: any) => validateField("cacheProtocolType", e, false),
       "cacheProtocolMethods": (e?: any) => validateField("cacheProtocolMethods", e, false),
       "headersToExcludeInHash": (e?: any) => validateField("headersToExcludeInHash", e, false),
       "headersToIncludeInHash": (e?: any) => validateField("headersToIncludeInHash", e, false),
       "responseCodes": (e?: any) => validateField("responseCodes", e, false),
       "enableCacheControl": (e?: any) => validateField("enableCacheControl", e, false),
       "includeAgeHeader": (e?: any) => validateField("includeAgeHeader", e, false),
       "hashGenerator": (e?: any) => validateField("hashGenerator", e, false),
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
                <h3>Type</h3>

                <Field>
                    <label>Cache Mediator Implementation</label>
                    <AutoComplete items={["Default", "611 Compatible"]} selectedItem={formValues["cacheMediatorImplementation"]} onChange={(e: any) => {
                        setFormValues({ ...formValues, "cacheMediatorImplementation": e });
                        formValidators["cacheMediatorImplementation"](e);
                    }} />
                    {errors["cacheMediatorImplementation"] && <Error>{errors["cacheMediatorImplementation"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Properties</h3>

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "611 compatible" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <label>Cache Type</label>
                        <AutoComplete items={["FINDER", "COLLECTOR"]} selectedItem={formValues["cacheType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "cacheType": e });
                            formValidators["cacheType"](e);
                        }} />
                        {errors["cacheType"] && <Error>{errors["cacheType"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "611 compatible" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Id"
                            size={50}
                            placeholder=""
                            value={formValues["id"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "id": e });
                                formValidators["id"](e);
                            }}
                            required={false}
                        />
                        {errors["id"] && <Error>{errors["id"]}</Error>}
                    </Field>
                }

                {formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Cache Timeout(S)"
                            size={50}
                            placeholder=""
                            value={formValues["cacheTimeout"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "cacheTimeout": e });
                                formValidators["cacheTimeout"](e);
                            }}
                            required={false}
                        />
                        {errors["cacheTimeout"] && <Error>{errors["cacheTimeout"]}</Error>}
                    </Field>
                }

                {formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Max Message Size(bytes)"
                            size={50}
                            placeholder=""
                            value={formValues["maxMessageSize"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "maxMessageSize": e });
                                formValidators["maxMessageSize"](e);
                            }}
                            required={false}
                        />
                        {errors["maxMessageSize"] && <Error>{errors["maxMessageSize"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "611 compatible" &&
                    <Field>
                        <label>Scope</label>
                        <AutoComplete items={["Per_Host", "Per_Mediator"]} selectedItem={formValues["scope"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "scope": e });
                            formValidators["scope"](e);
                        }} />
                        {errors["scope"] && <Error>{errors["scope"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "611 compatible" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="HashGenerator Attribute"
                            size={50}
                            placeholder=""
                            value={formValues["hashGeneratorAttribute"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "hashGeneratorAttribute": e });
                                formValidators["hashGeneratorAttribute"](e);
                            }}
                            required={false}
                        />
                        {errors["hashGeneratorAttribute"] && <Error>{errors["hashGeneratorAttribute"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Implementation</h3>

                {formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Max Entry Count"
                            size={50}
                            placeholder=""
                            value={formValues["maxEntryCount"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "maxEntryCount": e });
                                formValidators["maxEntryCount"](e);
                            }}
                            required={false}
                        />
                        {errors["maxEntryCount"] && <Error>{errors["maxEntryCount"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "611 compatible" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <label>Implementation Type</label>
                        <AutoComplete items={["memory", "disk"]} selectedItem={formValues["implementationType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "implementationType": e });
                            formValidators["implementationType"](e);
                        }} />
                        {errors["implementationType"] && <Error>{errors["implementationType"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>On Cache Hit</h3>

                {formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <label>Sequence Type</label>
                        <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} selectedItem={formValues["sequenceType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "sequenceType": e });
                            formValidators["sequenceType"](e);
                        }} />
                        {errors["sequenceType"] && <Error>{errors["sequenceType"]}</Error>}
                    </Field>
                }

                {formValues["sequenceType"] && formValues["sequenceType"].toLowerCase() == "registry_reference" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Sequence Key"
                            size={50}
                            placeholder=""
                            value={formValues["sequenceKey"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "sequenceKey": e });
                                formValidators["sequenceKey"](e);
                            }}
                            required={false}
                        />
                        {errors["sequenceKey"] && <Error>{errors["sequenceKey"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>Protocol</h3>

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <label>Cache Protocol Type</label>
                        <AutoComplete items={["HTTP"]} selectedItem={formValues["cacheProtocolType"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "cacheProtocolType": e });
                            formValidators["cacheProtocolType"](e);
                        }} />
                        {errors["cacheProtocolType"] && <Error>{errors["cacheProtocolType"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Cache Protocol Methods"
                            size={50}
                            placeholder=""
                            value={formValues["cacheProtocolMethods"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "cacheProtocolMethods": e });
                                formValidators["cacheProtocolMethods"](e);
                            }}
                            required={false}
                        />
                        {errors["cacheProtocolMethods"] && <Error>{errors["cacheProtocolMethods"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Headers To Exclude In Hash"
                            size={50}
                            placeholder=""
                            value={formValues["headersToExcludeInHash"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "headersToExcludeInHash": e });
                                formValidators["headersToExcludeInHash"](e);
                            }}
                            required={false}
                        />
                        {errors["headersToExcludeInHash"] && <Error>{errors["headersToExcludeInHash"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Headers To Include In Hash"
                            size={50}
                            placeholder=""
                            value={formValues["headersToIncludeInHash"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "headersToIncludeInHash": e });
                                formValidators["headersToIncludeInHash"](e);
                            }}
                            required={false}
                        />
                        {errors["headersToIncludeInHash"] && <Error>{errors["headersToIncludeInHash"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Response Codes"
                            size={50}
                            placeholder=""
                            value={formValues["responseCodes"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "responseCodes": e });
                                formValidators["responseCodes"](e);
                            }}
                            required={false}
                        />
                        {errors["responseCodes"] && <Error>{errors["responseCodes"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <VSCodeCheckbox type="checkbox" checked={formValues["enableCacheControl"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "enableCacheControl": e.target.checked });
                            formValidators["enableCacheControl"](e);
                        }
                        }>Enable Cache Control </VSCodeCheckbox>
                        {errors["enableCacheControl"] && <Error>{errors["enableCacheControl"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <VSCodeCheckbox type="checkbox" checked={formValues["includeAgeHeader"]} onChange={(e: any) => {
                            setFormValues({ ...formValues, "includeAgeHeader": e.target.checked });
                            formValidators["includeAgeHeader"](e);
                        }
                        }>Include Age Header </VSCodeCheckbox>
                        {errors["includeAgeHeader"] && <Error>{errors["includeAgeHeader"]}</Error>}
                    </Field>
                }

                {formValues["cacheMediatorImplementation"] && formValues["cacheMediatorImplementation"].toLowerCase() == "default" &&formValues["cacheType"] && formValues["cacheType"].toLowerCase() == "finder" &&
                    <Field>
                        <TextField
                            label="Hash Generator"
                            size={50}
                            placeholder=""
                            value={formValues["hashGenerator"]}
                            onChange={(e: any) => {
                                setFormValues({ ...formValues, "hashGenerator": e });
                                formValidators["hashGenerator"](e);
                            }}
                            required={false}
                        />
                        {errors["hashGenerator"] && <Error>{errors["hashGenerator"]}</Error>}
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

export default CacheForm; 

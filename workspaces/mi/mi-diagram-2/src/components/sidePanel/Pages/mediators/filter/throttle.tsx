/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 * 
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
*/


import React, { useEffect, useState } from 'react';
import { AutoComplete, Button, ComponentCard, ParamConfig, ParamManager, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import SidePanelContext from '../../../SidePanelContexProvider';
import { AddMediatorProps } from '../common';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getXML } from '../../../../../utils/template-engine/mustach-templates/templateUtils';
import { MEDIATORS } from '../../../../../resources/constants';
import { Range, TagRange } from '@wso2-enterprise/mi-syntax-tree/lib/src';

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

const generateDisplayValue = (paramValues: any) => {
    const result: string = paramValues.parameters[1].value + " | " + paramValues.parameters[2].value;
    return result.trim();
};

const ThrottleForm = (props: AddMediatorProps) => {
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);
    const [formValues, setFormValues] = useState({} as { [key: string]: any });
    const [errors, setErrors] = useState({} as any);

    const paramConfigs: ParamConfig = {
        paramValues: [],
        paramFields: [
            {
                id: 0,
                type: "Dropdown",
                label: "Throttle Type",
                defaultValue: "IP",
                isRequired: false,
                values: ["IP", "DOMAIN"]
            },
            {
                id: 1,
                type: "TextField",
                label: "Throttle Range",
                defaultValue: "default",
                isRequired: false,
            },
            {
                id: 2,
                type: "Dropdown",
                label: "Access Type",
                defaultValue: "Allow",
                isRequired: false,
                values: ["Allow", "Deny", "Control"]
            },
            {
                id: 3,
                type: "TextField",
                label: "Max Request Count",
                defaultValue: "0",
                isRequired: false,
            },
            {
                id: 4,
                type: "TextField",
                label: "Unit Time",
                defaultValue: "0",
                isRequired: false,
            },
            {
                id: 5,
                type: "TextField",
                label: "Prohibit Period",
                defaultValue: "0",
                isRequired: false,
            }
        ]
    };

    const [params, setParams] = useState(paramConfigs);

    const handleOnChange = (params: any) => {
        const modifiedParams = {
            ...params, paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.parameters[0].value,
                    value: generateDisplayValue(param),
                    icon: "query"
                }
            })
        };
        setParams(modifiedParams);
        setFormValues({ ...formValues, "isPolicyChanged": true })
    };


    useEffect(() => {
        if (sidePanelContext.formValues && Object.keys(sidePanelContext.formValues).length > 0) {
            setFormValues({
                ...formValues, ...sidePanelContext.formValues,
                "isThrottleChanged": false, "isPolicyChanged": false, "isOnAcceptChanged": false, "isOnRejectChanged": false
            });
            if (sidePanelContext.formValues["policyEntries"] && sidePanelContext.formValues["policyEntries"].length > 0) {
                const paramValues = sidePanelContext.formValues["policyEntries"].map((property: string, index: string) => (
                    {
                        id: index,
                        parameters: [
                            {
                                id: 0,
                                label: "throttleType",
                                type: "Dropdown",
                                value: property[0],
                                isRequired: false,
                                values: ["IP", "DOMAIN"]
                            },
                            {
                                id: 1,
                                label: "throttleRange",
                                type: "TextField",
                                value: property[1],
                                isRequired: false
                            },
                            {
                                id: 2,
                                label: "accessType",
                                type: "Dropdown",
                                value: property[2],
                                isRequired: false,
                                values: ["Allow", "Deny", "Control"]
                            },
                            {
                                id: 3,
                                label: "maxRequestCount",
                                type: "TextField",
                                value: property[3],
                                isRequired: false
                            },
                            {
                                id: 4,
                                label: "unitTime",
                                type: "TextField",
                                value: property[4],
                                isRequired: false
                            },
                            {
                                id: 5,
                                label: "prohibitPeriod",
                                type: "TextField",
                                value: property[5],
                                isRequired: false
                            }
                        ],
                        key: property[0],
                        value: property[1] + " | " + property[2],
                        icon: "query"
                    })
                )
                setParams({ ...params, paramValues: paramValues });
            }
        } else {
            setFormValues({
                "onAcceptBranchsequenceType": "ANONYMOUS",
                "onRejectBranchsequenceType": "ANONYMOUS",
                "policyType": "INLINE",
                "policyEntries": [] as string[][],
                "maximumConcurrentAccess": "0",
                "newMediator": true
            });
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
        formValues["policyEntries"] = params.paramValues.map(param => param.parameters.slice(0, 6).map(p => p.value));
        params.paramValues.forEach(param => {
            param.parameters.slice(0, 5).forEach(p => {
                let key = p.label.toLowerCase().replace(/\s/g, '');
                formValues[key] = p.value;
            });
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            if (formValues["newMediator"]) {
                await applyEdit(formValues, props.nodePosition);
            } else {
                const ranges = formValues["ranges"];
                const keys = Object.keys(ranges);
                const throttleRange: TagRange = ranges?.throttle;

                keys.sort((a, b) => {
                    const rangeA = ranges[a]?.startTagRange?.start?.line;
                    const rangeB = ranges[b]?.startTagRange?.start?.line;
                    if (rangeA == undefined && rangeB == undefined) return 0;
                    if (rangeA == undefined) return 1;
                    if (rangeB == undefined) return -1;
                    if (rangeA < rangeB) return 1;
                    if (rangeA > rangeB) return -1;
                    return 0;
                });

                for (let key of keys) {
                    switch (key) {
                        case "throttle":
                            if (formValues["isThrottleChanged"]) {
                                const data = { ...formValues, "editThrottle": true }
                                const editRange: Range = { start: throttleRange.startTagRange.start, end: throttleRange.startTagRange.end };
                                await applyEdit(data, editRange);
                            }
                            break;
                        case "policy":
                            if (formValues["isPolicyChanged"]) {
                                const data = { ...formValues, "editPolicy": true };
                                const policyRange: TagRange = ranges?.policy;
                                let editRange: Range;
                                if (policyRange) {
                                    editRange = {
                                        start: policyRange.startTagRange.start,
                                        end: policyRange.endTagRange.end ? policyRange.endTagRange.end : policyRange.startTagRange.end
                                    };
                                } else {
                                    editRange = { start: throttleRange.endTagRange.start, end: throttleRange.endTagRange.start }
                                }
                                await applyEdit(data, editRange);
                            }
                            break;
                        case "onAccept":
                            if (formValues["onAcceptBranchsequenceType"] != "ANONYMOUS" ||
                                sidePanelContext.formValues["onAcceptBranchsequenceType"] != "ANONYMOUS") {
                                const data = { ...formValues, "editOnAccept": true };
                                const onAcceptRange: TagRange = ranges?.onAccept;
                                let editRange: Range;
                                if (onAcceptRange) {
                                    editRange = {
                                        start: onAcceptRange.startTagRange.start,
                                        end: onAcceptRange.endTagRange.end ? onAcceptRange.endTagRange.end : onAcceptRange.startTagRange.end
                                    };
                                } else {
                                    editRange = { start: throttleRange.endTagRange.start, end: throttleRange.endTagRange.start }
                                }
                                await applyEdit(data, editRange);
                            }
                            break;
                        case "onReject":
                            if (formValues["onRejectBranchsequenceType"] != "ANONYMOUS"
                                || sidePanelContext.formValues["onRejectBranchsequenceType"] != "ANONYMOUS") {
                                const data = { ...formValues, "editOnReject": true };
                                const onRejectRange: TagRange = ranges?.onReject;
                                let editRange: Range;
                                if (onRejectRange) {
                                    editRange = {
                                        start: onRejectRange.startTagRange.start,
                                        end: onRejectRange.endTagRange.end ? onRejectRange.endTagRange.end : onRejectRange.startTagRange.end
                                    };
                                } else {
                                    editRange = { start: throttleRange.endTagRange.start, end: throttleRange.endTagRange.start }
                                }
                                await applyEdit(data, editRange);
                            }
                            break;
                    }
                }
            }

            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                isOpen: false,
                isEditing: false,
                formValues: undefined,
                nodeRange: undefined,
                operationName: undefined
            });
        }
    };

    const applyEdit = async (data: { [key: string]: any }, range: Range) => {
        const xml = getXML(MEDIATORS.THROTTLE, data);
        await rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri, range: range, text: xml
        });
    }

    const formValidators: { [key: string]: (e?: any) => string | undefined } = {
        "groupId": (e?: any) => validateField("groupId", e, false),
        "onAcceptBranchsequenceType": (e?: any) => validateField("onAcceptBranchsequenceType", e, false),
        "onAcceptBranchsequenceKey": (e?: any) => validateField("onAcceptBranchsequenceKey", e, false),
        "onRejectBranchsequenceType": (e?: any) => validateField("onRejectBranchsequenceType", e, false),
        "onRejectBranchsequenceKey": (e?: any) => validateField("onRejectBranchsequenceKey", e, false),
        "policyType": (e?: any) => validateField("policyType", e, false),
        "maximumConcurrentAccess": (e?: any) => validateField("maximumConcurrentAccess", e, false),
        "throttleType": (e?: any) => validateField("throttleType", e, false),
        "throttleRange": (e?: any) => validateField("throttleRange", e, false),
        "accessType": (e?: any) => validateField("accessType", e, false),
        "maxRequestCount": (e?: any) => validateField("maxRequestCount", e, false),
        "unitTime": (e?: any) => validateField("unitTime", e, false),
        "prohibitPeriod": (e?: any) => validateField("prohibitPeriod", e, false),
        "policyKey": (e?: any) => validateField("policyKey", e, false),
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
                <h3>General</h3>

                <Field>
                    <TextField
                        label="Group ID"
                        size={50}
                        placeholder=""
                        value={formValues["groupId"]}
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "groupId": e, "isThrottleChanged": true });
                            formValidators["groupId"](e);
                        }}
                        required={false}
                    />
                    {errors["groupId"] && <Error>{errors["groupId"]}</Error>}
                </Field>

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>OnAccept</h3>

                <Field>
                    <label>On Accept Branchsequence Type</label>
                    <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["onAcceptBranchsequenceType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "onAcceptBranchsequenceType": e, "isThrottleChanged": true, "isOnAcceptChanged": true });
                        formValidators["onAcceptBranchsequenceType"](e);
                    }} />
                    {errors["onAcceptBranchsequenceType"] && <Error>{errors["onAcceptBranchsequenceType"]}</Error>}
                </Field>

                {formValues["onAcceptBranchsequenceType"] && formValues["onAcceptBranchsequenceType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="On Accept Branchsequence Key"
                            size={50}
                            placeholder=""
                            value={formValues["onAcceptBranchsequenceKey"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "onAcceptBranchsequenceKey": e, "isThrottleChanged": true, "isOnAcceptChanged": true });
                                formValidators["onAcceptBranchsequenceKey"](e);
                            }}
                            required={false}
                        />
                        {errors["onAcceptBranchsequenceKey"] && <Error>{errors["onAcceptBranchsequenceKey"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>OnReject</h3>

                <Field>
                    <label>On Reject Branchsequence Type</label>
                    <AutoComplete items={["ANONYMOUS", "REGISTRY_REFERENCE"]} value={formValues["onRejectBranchsequenceType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "onRejectBranchsequenceType": e, "isThrottleChanged": true, "isOnRejectChanged": true });
                        formValidators["onRejectBranchsequenceType"](e);
                    }} />
                    {errors["onRejectBranchsequenceType"] && <Error>{errors["onRejectBranchsequenceType"]}</Error>}
                </Field>

                {formValues["onRejectBranchsequenceType"] && formValues["onRejectBranchsequenceType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="On Reject Branchsequence Key"
                            size={50}
                            placeholder=""
                            value={formValues["onRejectBranchsequenceKey"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "onRejectBranchsequenceKey": e, "isThrottleChanged": true, "isOnRejectChanged": true });
                                formValidators["onRejectBranchsequenceKey"](e);
                            }}
                            required={false}
                        />
                        {errors["onRejectBranchsequenceKey"] && <Error>{errors["onRejectBranchsequenceKey"]}</Error>}
                    </Field>
                }

            </ComponentCard>

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <h3>ThrottlePolicy</h3>

                <Field>
                    <label>Policy Type</label>
                    <AutoComplete items={["INLINE", "REGISTRY_REFERENCE"]} value={formValues["policyType"]} onValueChange={(e: any) => {
                        setFormValues({ ...formValues, "policyType": e, "isPolicyChanged": true });
                        formValidators["policyType"](e);
                    }} />
                    {errors["policyType"] && <Error>{errors["policyType"]}</Error>}
                </Field>


                {formValues["policyType"] && formValues["policyType"].toLowerCase() == "inline" &&
                    <Field>
                        <TextField
                            label="Maximum Concurrent Access"
                            size={50}
                            placeholder=""
                            value={formValues["maximumConcurrentAccess"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "maximumConcurrentAccess": e, "isPolicyChanged": true });
                                formValidators["maximumConcurrentAccess"](e);
                            }}
                            required={false}
                        />
                        {errors["maximumConcurrentAccess"] && <Error>{errors["maximumConcurrentAccess"]}</Error>}
                    </Field>
                }
                {formValues["policyType"] && formValues["policyType"].toLowerCase() == "inline" &&

                    <ComponentCard sx={cardStyle} disbaleHoverEffect>
                        <h3>Policy Entries</h3>

                        {formValues["policyEntries"] && (
                            <ParamManager
                                paramConfigs={params}
                                readonly={false}
                                onChange={handleOnChange} />
                        )}
                    </ComponentCard>
                }
                {formValues["policyType"] && formValues["policyType"].toLowerCase() == "registry_reference" &&
                    <Field>
                        <TextField
                            label="Policy Key"
                            size={50}
                            placeholder=""
                            value={formValues["policyKey"]}
                            onTextChange={(e: any) => {
                                setFormValues({ ...formValues, "policyKey": e, "isPolicyChanged": true });
                                formValidators["policyKey"](e);
                            }}
                            required={false}
                        />
                        {errors["policyKey"] && <Error>{errors["policyKey"]}</Error>}
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
                        onTextChange={(e: any) => {
                            setFormValues({ ...formValues, "description": e, "isThrottleChanged": true });
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

export default ThrottleForm; 

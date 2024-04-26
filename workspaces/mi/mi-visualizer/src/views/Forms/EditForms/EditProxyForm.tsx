/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import {
    Button,
    TextField,
    CheckBoxGroup,
    Dropdown,
    FormGroup,
    FormActions,
    FormCheckBox,
    FormView,
    Dialog
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter } from "@codemirror/lint";
import {XMLBuilder, XMLParser, XMLValidator} from "fast-xml-parser";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";

export type Protocol = "http" | "https";

export type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

type InputsFields = {
    name?: string;
    pinnedServers?: string;
    serviceGroup?: string;
    trace?: boolean;
    statistics?: boolean;
    startOnLoad?: boolean;
    transports?: string;
    transport?: {
        http: boolean;
        https: boolean;
        jms: boolean;
        vfs: boolean;
        local: boolean;
        malito: boolean;
        fix: boolean;
        rabbitmq: boolean;
        hl7: boolean;
    };
    enableAddressing?: boolean;
    endpointType?: string;
    endpoint?: string;
    faultSequenceType?: string;
    faultSequence?: string;
    inSequenceType?: string;
    inSequence?: string;
    inSequenceEdited?: boolean;
    outSequenceType?: string;
    outSequence?: string;
    outSequenceEdited?: boolean;
    securityEnabled?: boolean;
    wsdlType?: string;
    wsdlInLine?: string;
    preservePolicy?: boolean;
    wsdlUrl?: string;
    registryKey?: string;
    wsdlEndpoint?: string;
}    

export type Parameter = {
    name: string;
    textNode: string;
}

export type STNode = {
    hasTextNode: boolean;
}

export type Resource = {
    location: string;
    key: string;
    inSequenceAttribute?: string;
    outSequenceAttribute?: string;
    faultSequenceAttribute?: string;
}

export type ProxyPolicy = {
    key: string;
}

export type ProxyTarget = {
    endpointAttribute?: string;
    inSequenceAttribute?: string;
    outSequenceAttribute?: string;
    faultSequenceAttribute?: string;
}

export type ProxyPublishWSDL = {
    definitions: {
        name: string;
        targetNamespace: string;
    }
    inlineWsdl: string;
    preservePolicy: boolean;
    uri: string;
    key: string;
    resource: Resource[];
    endpoint: string;
}

export type EditProxyForm  = {
    name: string;
    enableSec: STNode;
    enableAddressing: STNode;
    parameters: Parameter[];
    policies: ProxyPolicy[];
    publishWSDL: ProxyPublishWSDL;
    wsdlType: string;
    target: ProxyTarget;
    transports: string;
    pinnedServers: string;
    serviceGroup: string;
    startOnLoad: boolean;
    statistics: boolean;
    trace: boolean;
    inSequenceEdited: boolean;
    outSequenceEdited: boolean;
};

export type SequenceOption = "inline" | "named";

const WSDL_Types = [
    "NONE",
    "INLINE",
    "SOURCE_URL",
    "REGISTRY_KEY",
    "ENDPOINT"
]

export type ProxyProps = {
    isOpen: boolean;
    proxyData: EditProxyForm;
    documentUri: string;
    onCancel: () => void;
    onSave: (data: EditProxyForm) => void;
};

const CheckBoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const ContentSeperator = styled.div`
    padding: 10px 10px;
    border-bottom: 0.5px solid #e0e0e0;
    justify-content: center;
`;

namespace Section {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    export const Title = styled.h4`
        display: flex;
        align-items: center;
        margin: 0;
        padding: 2px;
        width: 100%;
    `;

    export const IconContainer = styled.div`
        margin-left: auto;
    `;
}

export function EditProxyForm({ proxyData, isOpen, documentUri, onCancel, onSave }: ProxyProps) {
    const { rpcClient } = useVisualizerContext();
    const [proxyNames, setProxyNames] = useState<string[]>([]);
    const [proxyArtifactsNames, setProxyArtifactsNames] = useState<string[]>([]);
    const schema = yup
    .object({
        name: yup.string().required("Proxy  Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in Proxy name")
              .test('validateMessageStoreName',
              'Message Store file name already exists', value => {
                  return !proxyNames.includes(value)
              }).test('validateMessageStoreName',
                  'Message Store artifact name already exists', value => {
                      return !proxyArtifactsNames.includes(value)
                  }),
        wsdlType: yup.string(),
        transports: yup.string().required("Transports are required"),
        wsdlInLine: yup.string().required().when('wsdlType', {
            is: "INLINE",
            then: (schema)=>schema.required("Inline WSDL is required"),
            otherwise: (schema)=>schema.notRequired()
        }),
        wsdlUrl: yup.string().required().when('wsdlType', {
            is: "SOURCE_URL",
            then: (schema)=>schema.required("URL is required").matches(/^(?:(file):\/[^\s$.?#]+\.wsdl|(?:https?|tcp):\/\/[^\s$.?#]+(:[0-9]{1,5})?\.?[^\s]*$)/, "Invalid URL"),
            otherwise: (schema)=>schema.notRequired()
        }),         
    })
    const initialProxy:InputsFields = {
        name: proxyData?.name ?? "",
        pinnedServers: proxyData.pinnedServers ?? "",
        serviceGroup: proxyData.serviceGroup ?? "",
        trace: proxyData.trace ?? false,
        statistics: proxyData.statistics,
        startOnLoad: proxyData.startOnLoad ?? false,
        transports: proxyData.transports,
        transport: {
            http: proxyData.transports.includes("http"),
            https: proxyData.transports.includes("https"),
            jms: proxyData.transports.includes("jms"),
            vfs: proxyData.transports.includes("vfs"),
            local: proxyData.transports.includes("local"),
            malito: proxyData.transports.includes("malito"),
            fix: proxyData.transports.includes("fix"),
            rabbitmq: proxyData.transports.includes("rabbitmq"),
            hl7: proxyData.transports.includes("hl7"),
        },
        enableAddressing: proxyData.enableAddressing?.hasTextNode ?? false,
        endpointType :  proxyData.target?.endpointAttribute ? "named" : "inline",
        endpoint: proxyData.target?.endpointAttribute ,
        faultSequenceType: proxyData.target?.faultSequenceAttribute ? "named" : "inline",
        faultSequence: proxyData.target?.faultSequenceAttribute,
        inSequenceType: proxyData.target?.inSequenceAttribute ? "named" : "inline",
        inSequenceEdited: false,
        inSequence: proxyData.target?.inSequenceAttribute,
        outSequenceType: proxyData.target?.outSequenceAttribute ? "named" : "inline",
        outSequenceEdited: false,
        outSequence: proxyData.target?.outSequenceAttribute,
        securityEnabled: proxyData.enableSec?.hasTextNode ?? false,
        wsdlType: proxyData.wsdlType ?? "NONE",
        wsdlInLine: proxyData.publishWSDL?.inlineWsdl,
        preservePolicy: proxyData.publishWSDL?.preservePolicy ??true,
        wsdlUrl: proxyData.publishWSDL?.uri ?? "http://default/wsdl/url",
        registryKey: proxyData.publishWSDL?.key ?? "default_registry_key",
        wsdlEndpoint: proxyData.publishWSDL?.endpoint ?? "default_endpoint"
    }
    const {
        reset,
        register,
        formState: { errors, isDirty, isValid },
        handleSubmit,
        getValues,
        watch,
        control,
        setValue
    } = useForm<InputsFields>({
        defaultValues: initialProxy,
        resolver: yupResolver(schema), 
        mode: "onChange"
    });
    const [sequences, setSequences] = useState<string[]>([]);
    const [endpoints, setEndpoints] = useState<string[]>([]);
    const [wsdlRegistries, setWsdlRegistries] = useState<string[]>([]);
    const [policyRegistries, setPolicyRegistries] = useState<string[]>([]);
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [servicePolicies, setServicePolicies] = useState<ProxyPolicy[]>([]);
    const [isResourceAvailable, setResourceAvailability] = useState<boolean>(true);
    const [resourceType, setResourceType] = useState<string>("");
    const [wsdlResources, setWsdlResources] = useState<Resource[]>([]);
    const [isXML, setIsXML] = useState(true);
    const [xmlErrors, setXmlErrors] = useState({
        code: '',
        col: 0,
        line: 0,
        msg: '',
    });
    const [validationMessage, setValidationMessage] = useState<boolean>(true);
    const intialInSequenceType = proxyData.target?.inSequenceAttribute ? "named" : "inline";
    const intialOutSequenceType = proxyData.target?.outSequenceAttribute ? "named" : "inline";
    const [message , setMessage] = useState({
        isError: false,
        text: ""
    });
    const paramConfigs:ParamConfig = {
        paramValues: [],
        paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Name",
            defaultValue: "Parameter Name",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            defaultValue: "Parameter Value",
            isRequired: true
        }]
    }
    const [params, setParams] = useState(paramConfigs);
    const policyConfigs:ParamConfig = {
        paramValues: [],
        paramFields: [
        {
            id: 0,
            type: "Dropdown",
            label: "Service Policy",
            defaultValue: "value",
            isRequired: true,
            values: []
        }]
    }
    const [policies, setPolicies] = useState(policyConfigs);
    const resourceConfigs:ParamConfig = {
        paramValues: [],
        paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Location",
            defaultValue: "Resource Location",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Key",
            defaultValue: "Resource Key",
            isRequired: true
        }]
    }
    const [resources, setResources] = useState(resourceConfigs);
    
    proxyData.parameters?.forEach((param: any, index: number) => {
        paramConfigs.paramValues.push({
            id: index,
            paramValues: [
                {
                    value: param.name,
                },
                {
                    value: param.textNode,
                }
            ],
            key: param.name,
            value: param.textNode,
            icon: "query"
        });
    });

    proxyData.policies?.forEach((policy: any, index: number) => {
        policyConfigs.paramValues.push({
            id: index,
            paramValues: [
                {
                    value: policy.key,
                }
            ],
            key: (index + 1).toString(),
            value: policy.key,
            icon: "query"
        });
    });
    
    proxyData.publishWSDL?.resource?.forEach((resource: any, index: number) => {
        resourceConfigs.paramValues.push({
            id: index,
            paramValues: [
                {
                    value: resource.location
                },
                {
                    value: resource.key,
                }
            ],
            key: resource.key,
            value: resource.location,
            icon: "query"
        });
    });

    const handleOnChange = (params: any, type: string) => {
        const modifiedParams = { ...params, paramValues: params.paramValues.map((param: any) => {
            return {
                ...param,
                key: type !== "policies" ? param.parameters[0].value : param.key,
                value: type !== "policies" ? param.parameters[1].value  : param.parameters[0].value ?? "",
                icon: "query"
            }
        })};
        type === "parameters" ? setParams(modifiedParams) : type === "policies" ? setPolicies(modifiedParams) : setResources(modifiedParams);
    };

    const renderProps = (fieldName: keyof InputsFields) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const handleMessage = (text: string, isError: boolean) => {
        setMessage({
            isError: isError,
            text: text,
        });
    }

    const resourceAvailabilityDialog = (resourceType: string, isAvailable: boolean) => {
        return (
        <Dialog id='notFound' isOpen={!isAvailable} >
        <h2>
            There is no {resourceType} available for this service. Please add a {resourceType}.
        </h2>
        <Button appearance="secondary" onClick={()=> { setResourceAvailability(true)}}>Continue</Button>
        </Dialog>);
    }             

    const removeDuplicateResources = () => {
        const uniqueResources = wsdlResources?.filter((resource, index, self) =>
            index === self.findIndex((t) => (
                t.location === resource.location && t.key === resource.key
            ))
        )
        setWsdlResources(uniqueResources);
        return uniqueResources;
    };

    const removeDuplicateParameters = () => {
        const uniqueParameters = parameters?.filter((parameter, index, self) =>
            index === self.findIndex((t) => (
                t.name === parameter.name && t.textNode === parameter.textNode
            ))
        )
        setParameters(uniqueParameters);
        return uniqueParameters;
    };

    const removeDuplicatePolicies = () => {
        const uniquePolicies = servicePolicies?.filter((policy, index, self) =>
            index === self.findIndex((t) => (
                t.key === policy.key
            ))
        )
        setServicePolicies(uniquePolicies);
        return uniquePolicies;
    };

    const transportGenerator = () => {
        const transport = Object.keys(watch("transport") as Record<string, boolean>)
            .filter((key) => (watch("transport") as Record<string, boolean>)[key] === true)
            .join(" ");
        return transport;
    };

    const parametersParser = () => {
        params.paramValues.map((param: any) => {
            parameters.push({name: param.parameters[0].value, textNode: param.parameters[1].value});
        })
        return removeDuplicateParameters();
    }

    const policiesParser = () => {
        policies.paramValues.map((policy: any) => {
            servicePolicies.push({key: policy.parameters[0].value});
        })
        return removeDuplicatePolicies();
    }

    const resourcesParser = () => {
        resources.paramValues.map((resource: any) => {
            wsdlResources.push({location: resource.parameters[0].value, key: resource.parameters[1].value});
        })
        return removeDuplicateResources();
    }

    const isValidXML = (xmlString: string) => {
        const result = XMLValidator.validate(xmlString);
        if (result !== true) {
            setXmlErrors({ code: result.err.code, col: result.err.col, line: result.err.line, msg: result.err.msg });
            return false;
        }
        return true;
    };
  
    const handleXMLInputChange = (text: string) => {
        if (text.toLowerCase().startsWith("<wsdl:definitions" || "<wsdl:definitions>" || "<?wsdl:definitions" || "<?wsdl:definitions>")) {
            setIsXML(true);
        } else {
            setIsXML(false);
        }
        setValue("wsdlInLine", text);
        setValidationMessage(isValidXML(text));
    };

    const generateXmlData = () => {
        const options = {
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            attributeNamePrefix: "",
            attributesGroupName: "@_",
            indentBy: '    ',
            format: true,
        };
        const parser = new XMLParser(options);
        const builder = new XMLBuilder(options);
        const jsonData = parser.parse(getValues("wsdlInLine"));
        if(jsonData["wsdl:definitions"]["@_"]["xmlns"] || jsonData["wsdl:definitions"]["@_"]["xmlns:wsdl"]) {
            if (jsonData["wsdl:definitions"]["@_"]["xmlns"] === "http://ws.apache.org/ns/synapse") {
                delete jsonData["wsdl:definitions"]["@_"]["xmlns"];
            }
        }
        else {
             jsonData["wsdl:definitions"]["@_"]["xmlns"] = "";
        }
        console.log(jsonData);
        return builder.build(jsonData) as string;
    }

    React.useEffect(() => {
        (async () => {
            //transportParser(proxyData.transports);
            handleXMLInputChange(proxyData.publishWSDL?.inlineWsdl);
            let resources:string[] = []
            const sequence = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "sequence",
            });
            const wsdl_registry = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "wsdl",
            });
            const policy_registry = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "ws_policy",
            });
            console.log(sequence);
            console.log(policy_registry);
            const endpoint = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "endpoint",
            });
            if (sequences) {
                const sequenceNames = sequence.resources.map((resource) => resource.name);
                const registrySequences = sequence.registryResources.map((resource)=>resource.registryKey.replace(".xml",""))
                setSequences([...sequenceNames,...registrySequences]);
                setValue("inSequence", sequenceNames[0]);
                setValue("outSequence", sequenceNames[0]);
                setValue("faultSequence", sequenceNames[0]);
            }
            if (endpoints) {
                const endpointNames = endpoint.resources.map((resource) => resource.name);
                const registryEndpoints = endpoint.registryResources.map((resource)=>resource.registryKey)
                setEndpoints([...endpointNames,...registryEndpoints]);
                setValue("endpoint", endpointNames[0]);
            }
            if(wsdl_registry) {
                const registryNames = wsdl_registry.registryResources.map((resource) => resource.registryKey);
                setWsdlRegistries(registryNames);
                setValue("registryKey", registryNames[0]);
            }
            if(policy_registry) {
                const policyNames = policy_registry.registryResources.map((resource) => resource.registryKey);
                resources = [...resources, ...policyNames]
                setPolicyRegistries(policyNames);
                setValue("wsdlEndpoint", policyNames[0]);
            }
            console.log(resources);
            setPolicies({
                ...policies,
                paramFields:policies.paramFields.map((param:any)=>{
                    return {
                        ...param,
                        defaultValue: resources[0],
                        values: resources
                        }   
                })
            })
        })();
    }, [isOpen, documentUri]);

    useEffect(() => {
        (async () => {
            const proxy = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "proxyService",
            });
            console.log(proxy);
            if(proxy.resources) {
                const proxyNames = proxy.resources.map((resource: any) => resource.name.replace(proxyData.name, ""));
                setProxyNames(proxyNames);
                console.log(proxyNames);
                const proxyArtifactsNames = proxy.resources.map((resource) => resource.artifactPath.replace(".xml",'').replace(proxyData.name,""));
                setProxyArtifactsNames(proxyArtifactsNames);
                console.log(proxyArtifactsNames);
            }
        })();
    }, [proxyData]);
    
    useEffect(() => {
        setValue("transports", transportGenerator(), { shouldValidate: true ,shouldDirty: true });
        console.log(watch("transports"));
    }, [watch("transport.http"), watch("transport.https"), watch("transport.jms"), watch("transport.vfs"), watch("transport.local"), watch("transport.malito"), watch("transport.fix"), watch("transport.rabbitmq"), watch("transport.hl7")]);

    useEffect(() => {
        if(!isXML) {
            handleMessage("Entered In-Line Xml Should be in XML", true);
        } else if(!validationMessage) {
            handleMessage(`Error ${xmlErrors.code} , ${xmlErrors.msg} in line ${xmlErrors.line}, from ${xmlErrors.col} `, true);
        } else {
            handleMessage("", false);
        }
    }, [getValues("wsdlInLine")]);


    return (
        <FormView title="Edit Proxy" onClose={onCancel}>
                    <TextField
                        label="Name"
                        size={150}
                        {...renderProps("name")}
                    />
                    <TextField
                        label="Pinned Servers"
                        size={150}
                        {...renderProps("pinnedServers")}
                    />
                    <TextField
                        label="Service Group"
                        size={150}
                        {...renderProps("serviceGroup")}
                    />        
                    <CheckBoxGroup columns={3}>
                        <FormCheckBox label="Statistics" {...register("statistics")} control={control} />
                        <FormCheckBox label="Trace" {...register("trace")} control={control} />
                        <FormCheckBox label="Start On Load" {...register("startOnLoad")} control={control} />
                    </CheckBoxGroup>
                    <span>Transports</span>
                    <CheckBoxGroup columns={3}  >
                        <FormCheckBox label="HTTP" {...register("transport.http")} control={control}/>
                        <FormCheckBox label="HTTPS" {...register("transport.https")} control={control}/>
                        <FormCheckBox label="JMS" {...register("transport.jms")} control={control}/>
                        <FormCheckBox label="VFS" {...register("transport.vfs")} control={control}/>
                        <FormCheckBox label="Local" {...register("transport.local")} control={control}/>
                        <FormCheckBox label="MailTo" {...register("transport.malito")} control={control}/>
                        <FormCheckBox label="FIX" {...register("transport.fix")} control={control}/>
                        <FormCheckBox label="RabbitMQ" {...register("transport.rabbitmq")} control={control}/>
                        <FormCheckBox label="HL7" {...register("transport.hl7")} control={control}/>
                    </CheckBoxGroup>
                    <span style={{ color:"#f48771" }}>{errors["transports"]?.message.toString()}</span>
                    <FormGroup title="Advanced Options">
                        <React.Fragment>
                            <CheckBoxContainer>
                                <label>End Point</label>
                                <VSCodeRadioGroup
                                    orientation="horizontal"
                                    {...renderProps("endpointType")}
                                >
                                    <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                    <VSCodeRadio value="named">Named</VSCodeRadio>
                                </VSCodeRadioGroup>
                            </CheckBoxContainer>
                            {watch("endpointType") === "named" && (
                                <Dropdown
                                    items={endpoints.map((sequence, index) => ({
                                        id: index.toString(),
                                        content: sequence,
                                        value: sequence,
                                    }))}
                                    {...renderProps("endpoint")}
                                />
                            )}
                            <ContentSeperator></ContentSeperator>
                            <CheckBoxContainer>
                                <label>In Sequence</label>
                                <VSCodeRadioGroup
                                    orientation="horizontal"
                                    {...renderProps("inSequenceType")}
                                >
                                    <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                    <VSCodeRadio value="named">Named</VSCodeRadio>
                                </VSCodeRadioGroup>
                            </CheckBoxContainer>
                            {watch("inSequenceType") === "named" && (
                                <Dropdown
                                    items={sequences.map((sequence, index) => ({
                                        id: index.toString(),
                                        content: sequence,
                                        value: sequence,
                                    }))}
                                    {...renderProps("inSequence")}
                                />
                            )}
                            <ContentSeperator></ContentSeperator>
                            <CheckBoxContainer>
                                <label>Out Sequence</label>
                                <VSCodeRadioGroup
                                    orientation="horizontal"
                                    {...renderProps("outSequenceType")}
                                >
                                    <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                    <VSCodeRadio value="named">Named</VSCodeRadio>
                                </VSCodeRadioGroup>
                            </CheckBoxContainer>
                            {watch("outSequenceType") === "named" && (
                                <Dropdown
                                    items={sequences.map((sequence, index) => ({
                                        id: index.toString(),
                                        content: sequence,
                                        value: sequence,
                                    }))}
                                    {...renderProps("outSequence")}
                                />
                            )}
                            <ContentSeperator></ContentSeperator>
                            <CheckBoxContainer>
                                <label>Fault Sequence</label>
                                <VSCodeRadioGroup
                                    orientation="horizontal"
                                    {...renderProps("faultSequenceType")}
                                >
                                    <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                    <VSCodeRadio value="named">Named</VSCodeRadio>
                                </VSCodeRadioGroup>
                            </CheckBoxContainer>
                            {watch("faultSequenceType") === "named" && (
                                <Dropdown
                                    items={sequences.map((sequence, index) => ({
                                        id: index.toString(),
                                        content: sequence,
                                        value: sequence,
                                    }))}
                                    {...renderProps("faultSequence")}
                                />
                            )}
                            <ContentSeperator></ContentSeperator>
                            <h3>Service Parameters</h3>
                            <ParamManager
                                paramConfigs={params}
                                readonly={false}
                                onChange={(param)=>handleOnChange(param,"parameters")} />
                            <ContentSeperator></ContentSeperator>
                            <h3>Security</h3>
                            <FormCheckBox label="Enable Addressing" {...register("enableAddressing")} control={control} />
                            <FormCheckBox label="Security Enabled" {...register("securityEnabled")} control={control} />
                            <span>Service Policies</span>
                            <ParamManager
                                paramConfigs={policies}
                                readonly={false}
                                onChange={(param)=>handleOnChange(param,"policies")} />    
                            <ContentSeperator></ContentSeperator>
                            <h3>WDSL</h3>
                            <Dropdown
                                label="WSDL Type"                                        
                                items={WSDL_Types.map((type, index) => ({
                                    id: index.toString(),
                                    content: type,
                                    value: type,
                                }))}
                                {...renderProps("wsdlType")}
                            />
                            {watch("wsdlType") === "INLINE" && (
                                <>
                                    <span>WSDL XML</span>
                                    <CodeMirror
                                        value={watch("wsdlInLine")}
                                        theme={ oneDark }
                                        extensions={[xml()]}
                                        onChange={(text: string) => handleXMLInputChange(text)}
                                        height="200px"
                                        autoFocus
                                        indentWithTab={true}
                                        options={{
                                            lineNumbers: true,
                                            lint: true,
                                            mode: "xml",
                                            columns: 100,
                                            columnNumbers: true,
                                            lineWrapping: true,
                                        }}
                                    />
                                    {message.isError === true && <span style={{ color: message.isError ? "#f48771" : "" }}>{message.text}</span>}
                                    <FormCheckBox label="Preserve Policy" {...register("preservePolicy")} control={control} />
                                </>
                            )}
                            {watch("wsdlType") === "SOURCE_URL" && (
                                <TextField
                                    label="WSDL URL"
                                    size={150}
                                    {...renderProps("wsdlUrl")}
                                />
                            )}
                            {watch("wsdlType") === "REGISTRY_KEY" && (
                                <Dropdown
                                    items={wsdlRegistries.map((sequence, index) => ({
                                        id: index.toString(),
                                        content: sequence,
                                        value: sequence,
                                    }))}
                                    label="Registry Key"
                                    {...renderProps("registryKey")}
                                />
                            )}
                            {watch("wsdlType") === "ENDPOINT" && (
                                <>
                                    <FormCheckBox label="Preserve Policy" {...register("preservePolicy")} control={control} />
                                    <Dropdown                                       
                                        items={endpoints.map((sequence, index) => ({
                                            id: index.toString(),
                                            content: sequence,
                                            value: sequence,
                                        }))}
                                        label="WSDL Endpoint"
                                        {...renderProps("wsdlEndpoint")}
                                    />
                                </>
                            )}
                            {watch("wsdlType") !== "NONE" && watch("wsdlType") !=="ENDPOINT" && (
                                <>
                                    <span>WSDL Resources</span>
                                    <ParamManager
                                        paramConfigs={resources}
                                        readonly={false}
                                        onChange={(param)=>handleOnChange(param,"resources")} />
                                </>
                            )}
                        </React.Fragment>
                    </FormGroup>
                    <FormActions>
                        <Button appearance="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit((values) => {
                                onSave({
                                    enableSec: {
                                        hasTextNode: values.securityEnabled,
                                    },
                                    enableAddressing: {
                                        hasTextNode: false,
                                    },
                                    policies: policiesParser(),
                                    publishWSDL:{
                                        definitions:{
                                            name: "new",
                                            targetNamespace: values.wsdlType === "INLINE" ? generateXmlData() : "",
                                        },
                                        preservePolicy: values.wsdlType === "NONE" ? false : values.preservePolicy,
                                        inlineWsdl: values.wsdlType === "INLINE" ? values.wsdlInLine : "",
                                        uri: values.wsdlType === "SOURCE_URL" ? values.wsdlUrl : "",
                                        key: values.wsdlType === "REGISTRY_KEY" ? values.registryKey : "",
                                        resource: (values.wsdlType === "NONE" || values.wsdlType === "ENDPOINT") ? [] : resourcesParser(),
                                        endpoint: values.wsdlType === "ENDPOINT" ? values.wsdlEndpoint : "",
                                    },
                                    wsdlType: values.wsdlType,
                                    target: {
                                        endpointAttribute: values.endpointType === "named" ? values.endpoint : "",
                                        faultSequenceAttribute: values.faultSequenceType === "named" ? values.faultSequence : "",
                                        inSequenceAttribute: values.inSequenceType === "named" ? values.inSequence : "",
                                        outSequenceAttribute: values.outSequenceType === "named" ? values.outSequence : "",
                                    },
                                    name: values.name,
                                    transports: transportGenerator(),
                                    pinnedServers: values.pinnedServers,
                                    serviceGroup: values.serviceGroup,
                                    startOnLoad: values.startOnLoad,
                                    statistics: values.statistics,
                                    trace: values.trace,
                                    inSequenceEdited: intialInSequenceType !== values.inSequenceType,
                                    outSequenceEdited: intialOutSequenceType !== values.outSequenceType,
                                    parameters: parametersParser(),
                                },
                                )
                            })}
                            disabled={!isValid || !isDirty || !validationMessage}
                        >
                            Update
                        </Button>
                    </FormActions>
        </FormView>
    );
}

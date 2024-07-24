/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Button, TextField, FormCheckBox, FormView, FormActions, Card } from "@wso2-enterprise/ui-toolkit";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { TypeChip } from "../Commons";
import CardWrapper from "../Commons/CardWrapper";
import ParamForm from "./ParamForm";
import { Paramater, defaultParameters, inboundEndpointParams } from "./ParamTemplate";
import { FormKeylookup, ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";
import AddInboundConnector from "./inboundConnectorForm";
import { APIS } from "../../../constants";
import { VSCodeLink, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

const CheckboxGroup = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
});

const SampleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(176px, 1fr));
    gap: 20px;
`;

const LoaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 15px;
    height: 100px;
    width: 100%;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 50px;
    width: 50px;
    margin-top: auto;
    padding: 4px;
`;

export interface Region {
    label: string;
    value: string;
}

export interface InboundEPWizardProps {
    path: string;
}

type InboundEndpoint = {
    name: string;
    type: string;
    sequence?: string;
    errorSequence?: string;
    suspend?: boolean;
    trace?: boolean;
    statistics?: boolean;
    parameters: {}
};

const initialInboundEndpoint: InboundEndpoint = {
    name: "",
    type: "",
    sequence: "",
    errorSequence: "",
    suspend: false,
    trace: false,
    statistics: false,
    parameters: {}
};

const customSequenceType = {
    content: "custom-sequence",
    value: "custom",
};

const paramConfigs: ParamConfig = {
    paramValues: [],
    paramFields: [
        {
            id: 0,
            type: "TextField",
            label: "Key",
            defaultValue: "parameter.key",
            isRequired: true
        },
        {
            id: 1,
            type: "TextField",
            label: "Value",
            defaultValue: "Sample Value",
            isRequired: true
        }
    ]
}

export function InboundEPWizard(props: InboundEPWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const isNewInboundEndpoint = !props.path.endsWith(".xml");

    const [selectedParams, setSelectedParams] = useState<{ [key: string]: { [key: string]: Paramater; } }>({});
    const [sequences, setSequences] = useState([]);
    const [schemaParams, setSchemaParams] = useState({});
    const [customParams, setCustomParams] = useState(paramConfigs);
    const [connectors, setConnectors] = useState(undefined);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isFetchingConnectors, setIsFetchingConnectors] = useState(false);
    const [connectorSchema, setConnectorSchema] = useState(undefined);

    const [selected, setSelected] = useState({
        sequence: customSequenceType.value,
        errorSequence: customSequenceType.value,
    });

    const schema = yup.object({
        name: yup.string().required("Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name"),
        type: yup.string().required("Type is required"),
        sequence: yup.string().required("Sequence is required"),
        errorSequence: yup.string().required("Error Sequence is required"),
        suspend: yup.boolean(),
        trace: yup.boolean(),
        statistics: yup.boolean(),
        parameters: yup.object({
            ...schemaParams
        })
    });

    const formMethods = useForm({
        defaultValues: initialInboundEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const {
        reset,
        register,
        control,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        setValue,
    } = formMethods;

    useEffect(() => {
        (async () => {
            fetchConnectors();
            const sequenceList = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const newSequenceList = sequenceList.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });

            setSequences([customSequenceType, ...newSequenceList]);

            if (!isNewInboundEndpoint) {
                const { parameters, ...data } = await rpcClient.getMiDiagramRpcClient().getInboundEndpoint({ path: props.path });
                const uiSchema = await rpcClient.getMiDiagramRpcClient().getInboundEPUischema({
                    connectorName: data.type
                });

                data.type = data.type.toUpperCase();
                
                if (sequenceList.data[1].includes(data.sequence)) {
                    handleSequenceChange("sequence", data.sequence, false);
                }
                if (sequenceList.data[1].includes(data.errorSequence)) {
                    handleSequenceChange("errorSequence", data.errorSequence, false);
                }

                readyForm(data.type);
                setConnectorSchema(uiSchema);

                if (data.type.toLowerCase() === 'custom') {
                    const { coordination, sequential, interval, ...rest } = parameters;

                    setCustomParams((prev: any) => ({
                        paramFields: prev.paramFields,
                        paramValues: Object.keys(rest).filter((key: string) => (
                            key !== 'class' && key !== 'inbound.behavior'
                        )).map((key: string, index: number) => {
                            return {
                                id: prev.paramValues.length + index,
                                paramValues: [
                                    { value: key },
                                    { value: rest[key] as string },
                                ],
                                key,
                                value: rest[key] as string,
                            }
                        })
                    }));

                    reset({
                        ...data,
                        parameters: transformParams({
                            coordination,
                            sequential,
                            interval,
                            'class': parameters['class'],
                            'inbound.behavior': parameters['inbound.behavior'],
                        })
                    });
                } else {
                    reset({
                        ...data,
                        parameters: transformParams(parameters)
                    });
                }
            }
            else {
                setSelected({
                    sequence: customSequenceType.value,
                    errorSequence: customSequenceType.value,
                });
                reset(initialInboundEndpoint);
            }
        })();
    }, [props.path]);

    const fetchConnectors = async () => {
        setIsFetchingConnectors(true);
        try {
            const response = await fetch(APIS.CONNECTOR);
            const data = await response.json();
            setConnectors(data['inbound-connector-data'])
        } catch (e) {
            console.error("Error fetching connectors", e);
        }
        setIsFetchingConnectors(false);
    };

    const formTitle = isNewInboundEndpoint
        ? "Create new Listener"
        : "Edit Listener : " + props.path.replace(/^.*[\\/]/, '').split(".")[0];

    const handleCustomParams = (params: any) => {
        const modifiedParams = {
            ...params,
            paramValues: params.paramValues.map((param: any) => {
                return {
                    ...param,
                    key: param.paramValues[0].value,
                    value: param.paramValues[1].value,
                }
            })
        };
        setCustomParams(modifiedParams);
        if (!isDirty) {
            setValue("type", watch('type').toLowerCase(), { shouldDirty: true });
        }
    };

    const getCustomParams = () => {
        const params: { [key: string]: any } = {};
        customParams.paramValues.map((param: any) => {
            params[param.paramValues[0].value] = param.paramValues[1].value;
        });
        return params;
    }

    const renderProps = (fieldName: keyof InboundEndpoint) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const transformParams = (params: any, reverse: boolean = false) => {
        const s = reverse ? '-' : '.';
        const j = reverse ? '.' : '-';
        const parameters: { [key: string]: any } = {}
        for (const prop in params) {
            parameters[prop.split(s).join(j)] = params[prop];
        }
        if ("rabbitmq-server-host-name" in parameters && !("rabbitmq-exchange-autodeclare" in parameters)) {
            parameters["rabbitmq-exchange-autodeclare"] = true;
        }
        if ("rabbitmq-server-host-name" in parameters && !("rabbitmq-queue-autodeclare" in parameters)) {
            parameters["rabbitmq-queue-autodeclare"] = true;
        }
        return parameters;
    }

    const readyForm = (type: string) => {
        const params = inboundEndpointParams[type.toLowerCase()];
        setSelectedParams(params)

        const schemaItems: { [key: string]: any } = {};

        for (const group in params) {
            for (const prop in params[group]) {
                const param = params[group][prop];

                if (param.validate) {
                    let schemaItem;

                    if (param.validate?.type === 'string' && param.validate?.required) {
                        schemaItem = yup.string().required("This field is required");
                    } else if (param.validate?.type === 'number' && param.validate?.required) {
                        if (param.validate?.min !== undefined && param.validate?.max !== undefined) {
                            schemaItem = yup.number().required("This field is required")
                                .typeError("Invalid number")
                                .min(param.validate?.min, `Minimum value is ${param.validate?.min}`)
                                .max(param.validate?.max, `Maximum value is ${param.validate?.max}`);
                        }
                        else if (param.validate?.min !== undefined) {
                            schemaItem = yup.number().required("This field is required")
                                .typeError("Invalid number")
                                .min(param.validate?.min, `Minimum value is ${param.validate?.min}`);
                        }
                        else if (param.validate?.max !== undefined) {
                            schemaItem = yup.number().required("This field is required")
                                .typeError("Invalid number")
                                .max(param.validate?.max, `Maximum value is ${param.validate?.max}`);
                        } else {
                            schemaItem = yup.number().required("This field is required")
                                .typeError("Invalid number");
                        }
                    } else if (param.validate?.type === 'number') {
                        if (param.validate?.min !== undefined && param.validate?.max !== undefined) {
                            schemaItem = yup.number()
                                .transform((value, originalValue) => {
                                    return originalValue === '' ? null : value;
                                })
                                .nullable().typeError("Invalid number")
                                .min(param.validate?.min, `Minimum value is ${param.validate?.min}`)
                                .max(param.validate?.max, `Maximum value is ${param.validate?.max}`);
                        }
                        else if (param.validate?.min !== undefined) {
                            schemaItem = yup.number()
                                .transform((value, originalValue) => {
                                    return originalValue === '' ? null : value;
                                })
                                .nullable().typeError("Invalid number")
                                .min(param.validate?.min, `Minimum value is ${param.validate?.min}`);
                        }
                        else if (param.validate?.max !== undefined) {
                            schemaItem = yup.number()
                                .transform((value, originalValue) => {
                                    return originalValue === '' ? null : value;
                                })
                                .nullable().typeError("Invalid number")
                                .max(param.validate?.max, `Maximum value is ${param.validate?.max}`);
                        } else {
                            schemaItem = yup.number()
                                .transform((value, originalValue) => {
                                    return originalValue === '' ? null : value;
                                })
                                .nullable().typeError("Invalid number");
                        }
                    } else {
                        schemaItem = yup.string().notRequired();
                    }

                    schemaItems[prop.split('.').join('-')] = schemaItem;
                }
                else {
                    schemaItems[prop.split('.').join('-')] = yup.string().notRequired()
                }
            }
        };

        setSchemaParams(schemaItems);
    }

    const setInboundEndpointType = (type: string) => {
        setSelected({
            sequence: customSequenceType.value,
            errorSequence: customSequenceType.value,
        });
        reset({
            ...initialInboundEndpoint,
            parameters: transformParams(defaultParameters[type.toLowerCase()])
        })
        setValue("type", type);
        readyForm(type);
    }

    const selectConnector = async (connector: any) => {
        // Download connector from store
        setIsDownloading(true);
        let downloadSuccess = false;
        let attempts = 0;
        let uischema;

        while (!downloadSuccess && attempts < 3) {
            try {
                uischema = await rpcClient.getMiDiagramRpcClient().downloadInboundConnector({
                    url: connector.download_url
                });
                await rpcClient.getMiDiagramRpcClient().saveInboundEPUischema({
                    connectorName: uischema.uischema.name,
                    uiSchema: JSON.stringify(uischema.uischema)
                })
                setInboundEndpointType(connector.name);
                setConnectorSchema(uischema);
                downloadSuccess = true;
            } catch (error) {
                console.error('Error occurred while downloading connector:', error);
                attempts++;
            }
        }

        const ui = await rpcClient.getMiDiagramRpcClient().getInboundEPUischema({
            connectorName: uischema.uischema.name
        });
        setIsDownloading(false);
    }

    const handleSequenceChange = (field: 'sequence' | 'errorSequence', value: string, shouldDirty: boolean = true) => {
        setSelected((prev) => ({
            ...prev,
            [field]: value
        }));
        setValue(field, value === customSequenceType.value ? "" : value, { shouldDirty });
    }

    const handleCreateInboundEP = async (values: any) => {
        const createInboundEPParams = {
            directory: props.path,
            ...values,
            type: values.type?.toLowerCase() ?? "custom",
            parameters: {
                ...transformParams(values.parameters, true),
                ...((values.type?.toLowerCase() === 'custom') ? getCustomParams() : {})
            }
        }
        await rpcClient.getMiDiagramRpcClient().createInboundEndpoint(createInboundEPParams);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <FormView title={formTitle} onClose={handleOnClose}>
            {isNewInboundEndpoint && watch('type') === '' ? (
                isDownloading ? (
                    <LoaderWrapper>
                        <ProgressRing />
                        Downloading connector...
                    </LoaderWrapper>
                ) : (
                    <>
                        <span>Please select an inbound endpoint.</span>
                        <SampleGrid>
                            {connectors ?
                                connectors.sort((a: any, b: any) => a.rank - b.rank).map((connector: any) => (
                                    <Card
                                        key={connector.name}
                                        icon={connector.icon_url}
                                        title={connector.name}
                                        description={connector.description}
                                        onClick={() => selectConnector(connector)}
                                    />
                                )) : (
                                    isFetchingConnectors ? (
                                        <LoaderWrapper>
                                            <ProgressRing />
                                            Fetching connectors...
                                        </LoaderWrapper>
                                    ) : (
                                        <LoaderWrapper>
                                            <span>
                                                Failed to fetch store connectors. Please <VSCodeLink onClick={fetchConnectors}>retry</VSCodeLink>
                                            </span>
                                        </LoaderWrapper>
                                    )
                                )}
                        </SampleGrid>
                    </>
                )
            ) : (
                connectorSchema?.uischema && (
                    <AddInboundConnector formData={connectorSchema.uischema} path={props.path} setType={setInboundEndpointType}
                        handleCreateInboundEP={handleCreateInboundEP} />
                )
            )}
        </FormView>
    );
}

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
import { Button, TextField, Dropdown, FormCheckBox, FormView, FormActions } from "@wso2-enterprise/ui-toolkit";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { TypeChip } from "../Commons";
import CardWrapper from "../Commons/CardWrapper";
import ParamForm from "./ParamForm";
import { Paramater, defaultParameters, inboundEndpointParams } from "./ParamTemplate";

const CheckboxGroup = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
});

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

const hideSubFormTypes = ['HTTP', 'HTTPS', 'CXF_WS_RM', 'FEED'];

const customSequenceType = {
    content: "custom-sequence",
    value: "custom",
};

export function InboundEPWizard(props: InboundEPWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const isNewInboundEndpoint = !props.path.endsWith(".xml");

    const [selectedParams, setSelectedParams] = useState<{ [key: string]: { [key: string]: Paramater; } }>({});
    const [sequences, setSequences] = useState([]);
    const [showHiddenForm, setShowHiddenForm] = useState(false);
    const [schemaParams, setSchemaParams] = useState({});

    const [selected, setSelected] = useState({
        sequence: customSequenceType.value,
        errorSequence: customSequenceType.value,
    });

    const schema = yup.object({
        name: yup.string().required("Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name"),
        type: yup.string().required("Type is required"),
        sequence: yup.string(),
        errorSequence: yup.string(),
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
            const sequenceList = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            const newSequenceList = sequenceList.data[1].map((seq: string) => {
                seq = seq.replace(".xml", "");
                return { value: seq }
            });

            setSequences([customSequenceType, ...newSequenceList]);

            if (!isNewInboundEndpoint) {
                const { parameters, ...data } = await rpcClient.getMiDiagramRpcClient().getInboundEndpoint({ path: props.path });
                data.type = data.type.toUpperCase();
                setShowHiddenForm(hideSubFormTypes.includes(data.type));

                if (sequenceList.data[1].includes(data.sequence)) {
                    handleSequenceChange("sequence", data.sequence, false);
                }
                if (sequenceList.data[1].includes(data.errorSequence)) {
                    handleSequenceChange("errorSequence", data.errorSequence, false);
                }

                readyForm(data.type);
                reset({
                    ...data,
                    parameters: transformParams(parameters)
                });
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

    const formTitle = isNewInboundEndpoint
        ? "Create new Inbound Endpoint"
        : "Edit Inbound Endpoint : " + props.path.replace(/^.*[\\/]/, '').split(".")[0];

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
        return parameters;
    }

    const readyForm = (type: string) => {
        const params = inboundEndpointParams[type.toLowerCase()];
        setSelectedParams(params)
        setShowHiddenForm(hideSubFormTypes.includes(type));

        const schemaItems: { [key: string]: any } = {};

        for (const group in params) {
            for (const prop in params[group]) {
                const param = params[group][prop];

                if (param.validate) {
                    const validationType = param.validate?.type;
                    const schemaItem = validationType === 'number'
                        ? yup.number().required("This field is required").typeError("Invalid number")
                        : yup.string().required("This field is required");

                    if (param.validate.min !== undefined) {
                        schemaItem.min(param.validate.min, `Minimum value is ${param.validate.min}`);
                    }
                    if (param.validate.max !== undefined) {
                        schemaItem.max(param.validate.max, `Maximum value is ${param.validate.max}`);
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
            type: values.type.toLowerCase(),
            parameters: transformParams(values.parameters, true)
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
            {isNewInboundEndpoint && watch('type') === '' ? <CardWrapper cardsType="INBOUND_ENDPOINT" setType={setInboundEndpointType} /> : (
                <FormProvider {...formMethods}>
                    <TypeChip type={watch('type')} onClick={setInboundEndpointType} showButton={isNewInboundEndpoint} />
                    <TextField
                        required
                        autoFocus
                        label="Name"
                        placeholder="Name"
                        {...renderProps("name")}
                    />
                    {!showHiddenForm && (
                        <>
                            <div>
                                <Dropdown
                                    id="sequence"
                                    label="Sequence"
                                    value={selected.sequence}
                                    items={sequences}
                                    onValueChange={(value: string) => handleSequenceChange("sequence", value)}
                                />
                                {selected.sequence === customSequenceType.value && <>
                                    <TextField
                                        required
                                        placeholder="Custom Sequence Name"
                                        {...renderProps("sequence")}
                                    />
                                </>}
                            </div>
                            <div>
                                <Dropdown
                                    id="errorSequence"
                                    label="Error Sequence"
                                    value={selected.errorSequence}
                                    items={sequences}
                                    onValueChange={(value: string) => handleSequenceChange("errorSequence", value)}
                                />
                                {selected.errorSequence === customSequenceType.value && <>
                                    <TextField
                                        required
                                        placeholder="Custom on-error Sequence Name"
                                        {...renderProps("errorSequence")}
                                    />
                                </>}
                            </div>
                        </>
                    )}
                    <CheckboxGroup>
                        <FormCheckBox
                            name="suspend"
                            label="Suspend"
                            control={control}
                        />
                        <FormCheckBox
                            name="trace"
                            label="Trace Enabled"
                            control={control}
                        />
                        <FormCheckBox
                            name="statistics"
                            label="Statistics Enabled"
                            control={control}
                        />
                    </CheckboxGroup>
                    {watch('type') && <ParamForm params={selectedParams} />}
                    <FormActions>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit(handleCreateInboundEP)}
                            disabled={!isDirty}
                        >
                            {isNewInboundEndpoint ? "Create" : "Save Changes"}
                        </Button>
                        <Button
                            appearance="secondary"
                            onClick={openOverview}
                        >
                            Cancel
                        </Button>
                    </FormActions>
                </FormProvider>
            )}
        </FormView>
    );
}

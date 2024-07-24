/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import { AutoComplete, Button, FormActions, FormCheckBox, FormGroup, FormView, RequiredFormInput, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { useForm } from 'react-hook-form';
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { TypeChip } from '../Commons';
import { FormKeylookup } from '@wso2-enterprise/mi-diagram';
import FormGenerator from '../Commons/FormGenerator';

const CheckboxGroup = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
});

export interface AddInboundConnectorProps {
    changeConnector?: () => void;
    formData: any;
    parameters?: {};
    path: string;
    setType: (type: string) => void;
    handleCreateInboundEP: (values: any) => void;
    isEdit?: boolean;
}

type InboundEndpoint = {
    name: string;
    type: string;
    sequence?: string;
    errorSequence?: string;
    suspend?: boolean;
    trace?: boolean;
    statistics?: boolean;
    parameters: {};
    class: string;
    behavior: string;
    interval: string;
    sequential: boolean;
    coordination: boolean;
};

export function AddInboundConnector(props: AddInboundConnectorProps) {
    const { rpcClient } = useVisualizerContext();
    const { formData, handleCreateInboundEP } = props;
    const { control, handleSubmit, register, formState: { errors } } = useForm<any>();

    const renderProps = (fieldName: keyof InboundEndpoint) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const handleCreateInboundConnector = async (values: any) => {
        const { name, type, sequence, errorSequence, suspend, trace, statistics, class: className, behavior,
            interval, sequential, coordination, ...rest } = values;

        const inboundConnector: InboundEndpoint = {
            name,
            type: "custom",
            sequence,
            errorSequence,
            suspend,
            trace,
            statistics,
            class: className,
            behavior,
            interval,
            sequential,
            coordination,
            parameters: rest
        };

        handleCreateInboundEP(inboundConnector);
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    }

    return (
        <>
            <TypeChip type={formData.title} onClick={() => props.setType("")} showButton={true} />
            <TextField
                required
                autoFocus
                label="Name"
                placeholder="Name"
                {...renderProps("name")}
            />
            <div>
                <FormKeylookup
                    required
                    control={control}
                    label="Sequence"
                    name="sequence"
                    filterType="sequence"
                    path={props.path}
                    errorMsg={errors.sequence?.message.toString()}
                    {...register("sequence")}
                />
            </div>
            <div>
                <FormKeylookup
                    required
                    control={control}
                    label="Error Sequence"
                    name="errorSequence"
                    filterType="sequence"
                    path={props.path}
                    errorMsg={errors.errorSequence?.message.toString()}
                    additionalItems={["fault"]}
                    {...register("errorSequence")}
                />
            </div>
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
            <FormGroup
                key={formData.name}
                title={`${formData.title} Properties`}
                isCollapsed={false}
            >
                <FormGenerator formData={formData} control={control} errors={errors} />
            </FormGroup>
            <FormGroup
                key={"advanced"}
                title={"Advanced"}
                isCollapsed={true}
            >
                <TextField
                    required
                    label="Class"
                    placeholder="Class"
                    defaultValue={"org.wso2.carbon.inbound.kafka.KafkaMessageConsumer"}
                    {...renderProps("class")}
                />
                <AutoComplete
                    name={"behaviour"}
                    label={"Behavior (Select the behavior of the inbound endpoint)"}
                    items={["Polling Inbound Endpoint", "Listening Inbound Endpoint", "Event Based Inbound Endpoint"]}
                    required={true}
                    allowItemCreate={false}
                    {...renderProps("behavior")}
                />
                <TextField
                    required
                    label="Interval"
                    placeholder="Interval"
                    defaultValue={"1000"}
                    {...renderProps("interval")}
                />
                <CheckboxGroup>
                    <FormCheckBox
                        name="sequential"
                        label="Sequential (Enable sequential processing)"
                        control={control}
                    />
                    <FormCheckBox
                        name="coordination"
                        label="Coordination"
                        control={control}
                    />
                </CheckboxGroup>
            </FormGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateInboundConnector)}
                >
                    {props.isEdit ? "Update" : "Add"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleOnClose}
                >
                    Cancel
                </Button>
            </FormActions>
        </>
    );
};

export default AddInboundConnector;

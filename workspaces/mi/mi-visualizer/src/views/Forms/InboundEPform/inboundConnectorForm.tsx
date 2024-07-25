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
import { useEffect } from 'react';

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
    data?: {};
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
    const { formData, handleCreateInboundEP, parameters, data } = props;
    const { control, handleSubmit, register, formState: { errors }, setValue } = useForm<any>();

    useEffect(() => {
        if (parameters && data) {
            Object.entries(parameters).forEach(([key, value]) => {
                setValue(key, value);
            });

            Object.entries(data).forEach(([key, value]) => {
                setValue(key, value);
            });
        }
    }, [parameters]);

    function getOriginalName(name: string) {
        return name.replace('__dot__', '.');
    }

    const renderProps = (fieldName: keyof InboundEndpoint) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const handleCreateInboundConnector = async (values: any) => {
        const { name, type, sequence, onError, suspend, trace, statistics, behavior,
            sequential, coordination, ...rest } = values;

        // Transform the keys of the rest object
        const transformedParameters = Object.fromEntries(
            Object.entries(rest).map(([key, value]) => [getOriginalName(key), value])
            .filter(([_, value]) => typeof value !== 'object' || value === null)
        );

        const inboundConnector: InboundEndpoint = {
            name,
            type: "",
            sequence,
            errorSequence: onError,
            suspend,
            trace,
            statistics,
            class: values.class,
            behavior,
            interval: values.interval,
            sequential,
            coordination,
            parameters: transformedParameters
        };

        handleCreateInboundEP(inboundConnector);
    };

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    }

    return (
        <>
            <TypeChip type={formData.title} onClick={() => props.setType("")} showButton={true} />
            <FormGenerator formData={formData} control={control} errors={errors} setValue={setValue} />
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

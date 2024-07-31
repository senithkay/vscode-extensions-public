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
    model: any;
    path: string;
    setType: (type: string) => void;
    handleCreateInboundEP: (values: any) => void;
}

type InboundEndpoint = {
    parameters: {};
    attributes: {};
};

export function AddInboundConnector(props: AddInboundConnectorProps) {
    const { rpcClient } = useVisualizerContext();
    const { formData, handleCreateInboundEP, model } = props;
    const { control, handleSubmit, register, formState: { errors }, setValue, reset, watch } = useForm<any>();

    useEffect(() => {
        reset();
        if (model) {
            const attributeNames = getGenericAttributeNames(formData);
            
            attributeNames.forEach((attributeName: string) => {
                if (model.hasOwnProperty(attributeName)) {
                    setValue(getNameForController(attributeName), model[attributeName]);
                }
            });

            model.parameters[0]?.parameter?.forEach((param: any) => {
                setValue(getNameForController(param.name), param.content);
            });
        }
    }, [model, formData]);

    function getNameForController(name: string | number) {
        return String(name).replace(/\./g, '__dot__');
    }

    function getOriginalName(name: string) {
        return name.replace(new RegExp("__dot__", 'g'), '.');
    }

    function getGenericAttributeNames(jsonData: any) {
        const genericGroup = jsonData.elements.find((element: any) =>
            element.type === "attributeGroup" && element.value.groupName === "Generic"
        );
        if (genericGroup) {
            return genericGroup.value.elements
                .filter((element: any) => element.type === "attribute")
                .map((attribute: any) => attribute.value.name);
        }
        return [];
    }

    function extractProperties(values: any, attributeNames: string[]) {
        const attrFields: any = {};
        const paramFields = { ...values };
        attributeNames.forEach(name => {
            if (paramFields.hasOwnProperty(name)) {
                attrFields[name] = paramFields[name];
                delete paramFields[name];
            }
        });
        return { attrFields, paramFields };
    }

    const renderProps = (fieldName: keyof InboundEndpoint) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const handleCreateInboundConnector = async (values: any) => {
        const attributeNames = getGenericAttributeNames(formData);
        const { attrFields, paramFields } = extractProperties(values, attributeNames);

        // Transform the keys of the rest object
        const transformedParameters = Object.fromEntries(
            Object.entries(paramFields).map(([key, value]) => [getOriginalName(key), value])
                .filter(([_, value]) => value && typeof value !== 'object') 
        );

        const inboundConnector: InboundEndpoint = {
            attributes: attrFields,
            parameters: transformedParameters
        };

        handleCreateInboundEP(inboundConnector);
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const openInboundEPView = (documentUri: string) => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.InboundEPView, documentUri: documentUri } });
    };

    const handleOnClose = () => {
        const isNewTask = !props.model;
        if (isNewTask) {
            openOverview();
        } else {
            openInboundEPView(props.path);
        }
    }

    return (
        <>
            <TypeChip type={formData.title} onClick={() => props.setType("")} showButton={!props.model} />
            <FormGenerator formData={formData} control={control} errors={errors} setValue={setValue} watch={watch}/>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateInboundConnector)}
                >
                    {props.model ? "Update" : "Create"}
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

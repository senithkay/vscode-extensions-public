/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FormActions, Button } from "@wso2-enterprise/ui-toolkit";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import FormGenerator from "../../Form/FormGenerator";
import styled from "@emotion/styled";
import { sidepanelGoBack } from "..";
import SidePanelContext from "../SidePanelContexProvider";
import { useVisualizerContext, } from "@wso2-enterprise/mi-rpc-client";
import { getParamManagerValues } from "../Pages/mediators/common";
import { GetMediatorResponse } from "@wso2-enterprise/mi-core";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export interface MediatorFormProps {
    mediatorData: GetMediatorResponse
    mediatorType: string;
    isUpdate: boolean;
    documentUri: string;
    range: Range
}

const FormContainer = styled.div`
`;
export function MediatorForm(props: MediatorFormProps) {
    const { mediatorData, mediatorType, isUpdate, documentUri, range } = props;
    const { rpcClient } = useVisualizerContext();
    const sidePanelContext = useContext(SidePanelContext);
    const { control, handleSubmit, setValue, getValues, watch, reset, formState: { dirtyFields, errors } } = useForm<any>({
        defaultValues: {
        }
    });

    const handleOnSubmit = async (values: any) => {
        for (const key in values) {
            if (values[key]?.paramValues) {
                values[key] = getParamManagerValues(values[key]);
            }
        }
        await rpcClient.getMiDiagramRpcClient().updateMediator({
            mediatorType: mediatorType,
            newValues: values as Record<string, any>,
            oldValues: sidePanelContext.formValues as Record<string, any>,
            dirtyFields: Object.keys(dirtyFields),
            documentUri,
            range
        });
    }

    const handleOnClose = () => {
        sidepanelGoBack(sidePanelContext);
    }

    return (<FormContainer>
        <FormGenerator
            formData={mediatorData.form}
            control={control}
            errors={errors}
            setValue={setValue}
            reset={reset}
            watch={watch}
            getValues={getValues}
            skipGeneralHeading={true} />
        <FormActions>
            <Button
                appearance="secondary"
                onClick={handleOnClose}
            >
                Cancel
            </Button>
            <Button
                appearance="primary"
                onClick={handleSubmit(handleOnSubmit)}
            >
                {isUpdate ? "Update" : "Add"}
            </Button>
        </FormActions>
    </FormContainer>);
}

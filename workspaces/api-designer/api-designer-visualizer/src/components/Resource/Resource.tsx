/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Dropdown, SidePanelBody, SidePanelTitleContainer, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Operation, Param } from '../../Definitions/ServiceDefinitions';
import { ParamEditor } from '../Parameter/ParamEditor';
import { getHeaderParametersFromParameters, getPathParametersFromParameters, getQueryParametersFromParameters } from '../Utils/OpenAPIUtils';
import { useEffect, useState } from 'react';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

interface OverviewProps {
    method: string;
    path: string;
    resourceOperation: Operation;
}

const schema = yup.object({
    method: yup.string(),
    path: yup.string(),
    queryParams: yup.array().of(
        yup.object().shape({
            name: yup.string(),
            type: yup.string(),
            defaultValue: yup.string(),
            isArray: yup.boolean(),
            isRequired: yup.boolean()
        })
    ),
    pathParams: yup.array().of(
        yup.object().shape({
            name: yup.string(),
            type: yup.string(),
            defaultValue: yup.string(),
            isArray: yup.boolean(),
            isRequired: yup.boolean()
        })
    ),
    headerParams: yup.array().of(
        yup.object().shape({
            name: yup.string(),
            type: yup.string(),
            defaultValue: yup.string(),
            isArray: yup.boolean(),
            isRequired: yup.boolean()
        })
    )
});

type InputsFields = {
    method: string;
    path: string;
    queryParams: Param[];
    pathParams: Param[];
    headerParams: Param[];
};

export function Resource(props: OverviewProps) {
    const { resourceOperation, method, path } = props;
    const defaultValues: InputsFields = {
        method: method.toLocaleUpperCase(),
        path: path,
        queryParams: getQueryParametersFromParameters(resourceOperation.parameters),
        pathParams: getPathParametersFromParameters(resourceOperation.parameters),
        headerParams: getHeaderParametersFromParameters(resourceOperation.parameters)
    };
    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        setValue,
        control,
        watch,
    } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const handleOnQueryParamsChange = (params: Param[]) => {
        setValue("queryParams", params);
    };
    const handleOnPathParamsChange = (params: Param[]) => {
        const pathParams = params.map((param) => {
            return `{${param.name}}`;
        }).join("/");
        const path = getValues("path");
        let containsInitialSlash = path.startsWith("/");
        const initialSlashRemovedPath = 
            path.startsWith("/") ? path.substring(1) : path;
        const pathParamSanitizedPath = initialSlashRemovedPath.split("/")[0];
        setValue("path", `${containsInitialSlash ? "/" : ""}${pathParamSanitizedPath}/${pathParams}`);
        setValue("pathParams", params);
    };
    const handleOnHeaderParamsChange = (params: Param[]) => {
        setValue("headerParams", params);
    };

    const handlePathChange = (value: string) => {
        const pathParams = value.split('/').filter((part: string) => part.startsWith('{') && part.endsWith('}')).map((part: string) => part.substring(1, part.length - 1));
        setValue("pathParams", pathParams.map((paramName: string) => ({ name: paramName, type: "", defaultValue: "", isArray: false, isRequired: false })));
    };

    // Method to get Form values
    const getFormValues = () => {
        const values = getValues();
        console.log("Form Values", values);
    }

    console.log("Query Params", watch("queryParams"));

    useEffect(() => {
        setValue("method", method);
        setValue("path", path);
        setValue("queryParams", getQueryParametersFromParameters(resourceOperation.parameters));
        setValue("pathParams", getPathParametersFromParameters(resourceOperation.parameters));
        setValue("headerParams", getHeaderParametersFromParameters(resourceOperation.parameters));
    } , [method, path]);

    return (
        <>
            <SidePanelTitleContainer>
                <Typography sx={{ margin: 0 }} variant="h3">Resource Path</Typography>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <HorizontalFieldWrapper>
                    <Dropdown
                        id="method"
                        containerSx={{ width: "20%", gap: 0 }}
                        dropdownContainerSx={{ gap: 0 }}
                        items={[
                            { value: "get", content: "GET" },
                            { value: "post", content: "POST" },
                            { value: "put", content: "PUT" },
                            { value: "delete", content: "DELETE" },
                            { value: "patch", content: "PATCH" },
                            { value: "options", content: "OPTIONS" },
                        ]}
                        {...register("method")}
                    />
                    <TextField
                        id="path"
                        sx={{ width: "80%" }}
                        onTextChange={handlePathChange}
                        {...register("path")}
                    />
                </HorizontalFieldWrapper>
                <ParamEditor params={watch("pathParams")} type="Path" onParamsChange={handleOnPathParamsChange} />
                <ParamEditor params={watch("queryParams")} type="Query" onParamsChange={handleOnQueryParamsChange} />
                <ParamEditor params={watch("headerParams")} type="Header" onParamsChange={handleOnHeaderParamsChange} />
            </SidePanelBody>
        </>
    )
}

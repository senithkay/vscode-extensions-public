/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import { ParamItem, ParameterConfig } from '../ParamEditor/ParamItem';
import { PARAM_TYPES, ParamEditor } from '../ParamEditor/ParamEditor';
import styled from '@emotion/styled';

export interface ResourceParamProps {
    // parameters: ResourceParam[];
    parameters: ParameterConfig[];
    onChange?: (parameters: ParameterConfig[]) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function ResourceParam(props: ResourceParamProps) {
    const { parameters, readonly, onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);

    const onEdit = (param: ParameterConfig) => {
        setEditingSegmentId(param.id);
    };

    const onAddClick = () => {
        const updatedParameters = [...parameters];
        console.log("before adding", updatedParameters);
        setEditingSegmentId(updatedParameters.length);
        const newParam: ParameterConfig = {
            id: updatedParameters.length,
            name: "param",
            type: "string",
            option: PARAM_TYPES.DEFAULT,
            defaultValue: ""
        };
        console.log("new param", newParam);
        updatedParameters.push(newParam);
        console.log("new Param", updatedParameters);
        onChange(updatedParameters);
        setIsNew(true);
    };

    const onDelete = (param: ParameterConfig) => {
        const updatedParameters = [...parameters];
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
            updatedParameters.splice(indexToRemove, 1);
        }
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        onChange(reArrangedParameters);
    };

    const onChangeParam = (paramConfig: ParameterConfig) => {
        const updatedParameters = [...parameters];
        const index = updatedParameters.findIndex(param => param.id === paramConfig.id);
        if (index !== -1) {
            updatedParameters[index] = paramConfig;
        }
        onChange(updatedParameters);
        setEditingSegmentId(-1);
    };

    const onParamEditCancel = (id?: number) => {
        setEditingSegmentId(-1);
        if (isNew) {
            onDelete({ id, name: "" });
        }
        setIsNew(false);
        onChange(parameters);
    };

    const paramComponents: React.ReactElement[] = [];

    // parameters
    //     .forEach((param, index) => {
    //         if ((editingSegmentId !== index)) {
    //             paramComponents.push(
    //                 <ParamItem
    //                     param={{
    //                         id: index,
    //                         name: param.name,
    //                         type: param.type,
    //                         option: param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT,
    //                         defaultValue: param.default?.replace("=", "").trim()
    //                     }}
    //                     readonly={editingSegmentId !== -1 || readonly}
    //                     onDelete={onDelete}
    //                     onEditClick={onEdit}
    //                 />
    //             );
    //         } else if (editingSegmentId === index) {
    //             isEditingPram = true;
    //             paramComponents.push(
    //                 <ParamEditor
    //                     segmentId={index}
    //                     syntaxDiagnostics={syntaxDiag}
    //                     model={param}
    //                     completions={completions}
    //                     isEdit={true}
    //                     alternativeName={param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? "Identifier Name" : "Name"}
    //                     optionList={[PARAM_TYPES.DEFAULT, PARAM_TYPES.HEADER]}
    //                     option={param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT}
    //                     isTypeReadOnly={false}
    //                     onChange={onParamChange}
    //                     onCancel={onParamEditCancel}
    //                 />
    //             )
    //         }
    //     });

    parameters
        .forEach((param: ParameterConfig, index) => {
            if (editingSegmentId === index) {
                paramComponents.push(
                    <ParamEditor
                        param={{
                            id: index,
                            name: param.name,
                            type: param.type,
                            option: param.option,
                            defaultValue: param.defaultValue
                        }}
                        isEdit={true}
                        optionList={[PARAM_TYPES.DEFAULT, PARAM_TYPES.HEADER]}
                        option={param.option}
                        isTypeReadOnly={false}
                        onChange={onChangeParam}
                        onCancel={onParamEditCancel}
                    />
                )
            }  else if ((editingSegmentId !== index)) {
                paramComponents.push(
                    <ParamItem
                        param={{
                            id: index,
                            name: param.name,
                            type: param.type,
                            option: param.option,
                            defaultValue: param.defaultValue
                        }}
                        readonly={editingSegmentId !== -1 || readonly}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
                );
            }
        });

    return (
        <div>
            {paramComponents}
            {(editingSegmentId === -1) && (
                <AddButtonWrapper>
                    <LinkButton onClick={onAddClick} >
                        <Codicon name="add"/>
                        <>Add Parameter</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
            {/* {(editingSegmentId !== -1) && !isEditingPram && (
                <div>
                    <TextPreloaderVertical position="fixedMargin" />
                </div>
                )} */}
        </div>
    );
}

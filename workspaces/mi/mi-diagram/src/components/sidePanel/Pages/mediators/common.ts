/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { MACHINE_VIEW, POPUP_EVENT_TYPE, ParentPopupData } from '@wso2-enterprise/mi-core';
import { RpcClient } from '@wso2-enterprise/mi-rpc-client';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { ParamConfig } from '../../../Form';

export interface AddMediatorProps {
    nodePosition: Range;
    documentUri: string;
}

export function filterFormValues(formValues: { [key: string]: any }, keysToInclude: string[], keysToExclude: string[]): { [key: string]: any } {
    if (keysToInclude && keysToInclude.length > 0) {
        Object.keys(formValues).forEach(key => {
            if (!keysToInclude.includes(key)) {
                delete formValues[key];
            }
        });
    }
    if (keysToExclude && keysToExclude.length > 0) {
        Object.keys(formValues).forEach(key => {
            if (keysToExclude.includes(key)) {
                delete formValues[key];
            }
        });
    }
    return formValues;
}

export const openPopup = (rpcClient: RpcClient, view: string, fetchItems: any, setValue: any) => {
    let form;
    switch (view) {
        case "endpoint":
            form = MACHINE_VIEW.EndPointForm;
            break;
    }
    rpcClient.getMiVisualizerRpcClient().openView({ type: POPUP_EVENT_TYPE.OPEN_VIEW, location: { view: form }, isPopup: true });

    rpcClient.onParentPopupSubmitted((data: ParentPopupData) => {
        if (data.recentIdentifier) {
            fetchItems();
            setValue(data.recentIdentifier);
        }
    });
}

export const getParamManagerValues = (paramManager: ParamConfig): any[] => {
    return paramManager.paramValues.map((param: any) => param.paramValues.map((p: any) => {
        if (p?.value?.paramValues) {
            return getParamManagerValues(p.value);
        }
        return p.value;
    }));
}

export const getParamManagerFromValues = (values: any[]): any => {

    const getParamValues = (value: any): any => {
        return value.map((v: any) => {
            if (v instanceof Array) {
                return {
                    value: {
                        paramValues: getParamManagerFromValues(v)
                    }
                }
            }
            return { value: v };
        });
    }

    const paramValues = values.map((value: any, index: number) => {

        if (typeof value === 'object' && value !== null) {
            const paramValues = getParamValues(value);
            return { id: index, key: index, value: typeof value[1] === 'object' ? value[1].value : value[1], icon: 'query', paramValues };
        } else {
            return { value };
        }
    });
    return paramValues;
}

/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useEffect, useState } from 'react';

import {
    FormTextInput, ParamEditor,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import debounce from "lodash.debounce";

import { useStyles } from "./styles";
import { Payload } from "./types";

export interface PayloadEditorProps {
    payload: Payload;
    readonly?: boolean;
    syntaxDiag?: string;
    nameSemDiag?: string;
    typeSemDiag?: string;
    onChange: (payloadString: string, payLoad: Payload) => void
}

export function PayloadEditor(props: PayloadEditorProps) {
    const { payload, syntaxDiag = null, nameSemDiag, typeSemDiag, readonly, onChange } = props;

    const onParamChange = (param: { id: number, name: string, dataType: string, defaultValue?: string }) => {
        const {name, dataType, defaultValue} = param;
        onChange(`@http:Payload ${dataType} ${name}${defaultValue ? ` = ${defaultValue}}` : ""}` ,
            {type: dataType, name, defaultValue});
    };

    return (
        <div>
            <ParamEditor
                param={{id: 0, name: payload.name, dataType: payload.type}}
                syntaxDiag={syntaxDiag}
                onChange={onParamChange}
                nameDiagnostics={nameSemDiag}
                typeDiagnostics={typeSemDiag}
                hideButtons={true}
                disabled={readonly}
            />
        </div>
    );
}

/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from 'react';
import { Type } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { TypeEditor, TypeHelperCategory } from '@wso2-enterprise/type-editor';
import { TYPE_HELPER_OPERATORS } from './constants';
import { getCategories } from './utils';

type FormTypeEditorProps = {
    type?: Type;
    onTypeChange: (type: Type) => void;
    newType: boolean;
    isGraphql?: boolean;
};

export const FormTypeEditor = (props: FormTypeEditorProps) => {
    const { type, onTypeChange, newType, isGraphql } = props;
    const { rpcClient } = useRpcContext();
    const [categories, setCategories] = useState<TypeHelperCategory[]>([]);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((machineView) => {
                rpcClient
                    .getBIDiagramRpcClient()
                    .getVisibleTypes({
                        filePath: machineView.metadata.recordFilePath,
                        position: {
                            line: 0,
                            offset: 0
                        }
                    })
                    .then((types) => {
                        setCategories(getCategories(types));
                    })
            });
        }
    }, []);

    return (
        <TypeEditor
            type={type}
            rpcClient={rpcClient}
            onTypeChange={onTypeChange}
            newType={newType}
            isGraphql={isGraphql}
            categories={categories}
            operators={TYPE_HELPER_OPERATORS}
        />
    );
};

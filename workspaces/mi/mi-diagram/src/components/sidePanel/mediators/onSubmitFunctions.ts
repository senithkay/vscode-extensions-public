/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';

export function createAndopenDataMapper(documentUri: string, formValues: { [key: string]: any; }, rpcClient: any) {
    const configName = formValues.name;
    const configurationLocalPath = 'gov:/datamapper/' + configName + '/' + configName + '.dmc';
    return () => {

        const request = {
            sourcePath: documentUri,
            regPath: configurationLocalPath
        };
        if (configName === "") {
            return;
        }
        const dmCreateRequest = {
            dmLocation: "",
            filePath: documentUri,
            dmName: configName
        };
        rpcClient.getMiDataMapperRpcClient().createDMFiles(dmCreateRequest).then((response: any) => {
            rpcClient.getMiDataMapperRpcClient().convertRegPathToAbsPath(request).then((response: any) => {
                // open data mapper view
                rpcClient.getVisualizerState().then((state: any) => {
                    rpcClient.getMiVisualizerRpcClient().openView({
                        type: EVENT_TYPE.OPEN_VIEW,
                        location: {
                            ...state,
                            documentUri: response.absPath,
                            view: MACHINE_VIEW.DataMapperView,
                            dataMapperProps: {
                                filePath: response.absPath,
                                configName: configName
                            }
                        }
                    });
                });
            });
        });
    };
}

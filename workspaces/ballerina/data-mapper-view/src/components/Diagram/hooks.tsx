/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query';
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { Uri } from "monaco-editor";

export const useProjectComponents = (getDiagramEditorLangClient: Promise<IBallerinaLangClient>, currentFilePath: string, currentFileContent: string): {
    projectComponents: BallerinaProjectComponents,
    isFetching: boolean,
    isError: boolean,
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<unknown, Error>>
} => {
    const fetchProjectComponents = async () => {
    try {
        const langClient = await getDiagramEditorLangClient;
        const componentResponse = await langClient.getBallerinaProjectComponents({
            documentIdentifiers: [
                {
                    uri: Uri.file(currentFilePath).toString(),
                }
            ]
        })
        return componentResponse;
        } catch (networkError: any) {
            return null;
        }
    };

    const {
        data: projectComponents,
        isFetching,
        isError,
        refetch,
      } = useQuery({
        queryKey: ['fetchProjectComponents', { currentFilePath, currentFileContent }],
        queryFn: () => fetchProjectComponents()
      });

    return { projectComponents, isFetching, isError, refetch };
  };

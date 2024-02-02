// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import { CompletionResponse } from "@wso2-enterprise/ballerina-core";
import { AutoComplete, ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
    isLoading: boolean;
    recordCompletions: CompletionResponseWithModule[];
}

export interface CompletionResponseWithModule extends CompletionResponse {
    module?: string;
}

export function TypeBrowser(props: TypeBrowserProps) {
    const { type, onChange, isLoading, recordCompletions } = props;
    const [selectedTypeStr, setSelectedTypeStr] = useState(type?.split(':')?.pop() || '')

    useEffect(() => {
        setSelectedTypeStr(type?.split(':')?.pop() || '')
    }, [type])


    return (
        <>
            <AutoComplete
                key={`type-select-${isLoading.toString()}`}
                data-testid='type-select-dropdown'
                items={recordCompletions.map(
                    item => item?.module ? `${item.module}:${item.insertText}` : item?.insertText
                )}
                selectedItem={selectedTypeStr}
                onChange={onChange}
                borderBox={true}
            />
            {isLoading && <ProgressIndicator data-testid={'type-select-linear-progress'} />}
        </>
    );
}


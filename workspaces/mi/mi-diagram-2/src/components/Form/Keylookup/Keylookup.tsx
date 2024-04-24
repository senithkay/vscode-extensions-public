/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { AutoComplete, ErrorBanner, getItemKey, ItemComponent } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import styled from "@emotion/styled";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type FilterType =
    | "sequence"
    | "proxyService"
    | "endpoint"
    | "messageStore"
    | "messageProcessor"
    | "task"
    | "sequenceTemplate"
    | "endpointTemplate"
    | "dataService"
    | "dataSource"
    | "localEntry"
    | "dataMapper"
    | "js"
    | "json"
    | "smooksConfig"
    | "wsdl"
    | "ws_policy"
    | "xsd"
    | "xsl"
    | "xslt"
    | "yaml";

// Interfaces
export interface IKeylookup {
    // AutoComplete props
    id?: string;
    required?: boolean;
    label?: string;
    notItemsFoundMessage?: string;
    widthOffset?: number;
    nullable?: boolean;
    allowItemCreate?: boolean;
    sx?: React.CSSProperties;
    borderBox?: boolean;
    errorMsg?: string;
    value?: string;
    onValueChange?: (item: string, index?: number) => void;
    name?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    // Document path
    path?: string;
    // Artifact type to be fetched
    filterType?: FilterType;
    // Callback to filter the fetched artifacts
    filter?: (value: string) => boolean;
    onCreateButtonClick?: (fetchItems: any, handleValueChange: any) => void;
}

export type IFormKeylookup<T extends FieldValues> = IKeylookup & UseControllerProps<T>;

// Styles
const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: "2px",
});

const ItemContainer = styled.div({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "22px",
});

const StyledTag = styled(VSCodeTag)({
    "::part(control)": {
        textTransform: "lowercase",
    },
});

const ItemText = styled.div({
    flex: "1 1 auto",
});

const getItemComponent = (item: string, type?: "reg:") => {
    return (
        <ItemContainer>
            {type && <StyledTag>{type}</StyledTag>}
            <ItemText>{item}</ItemText>
        </ItemContainer>
    );
};

export const Keylookup = (props: IKeylookup) => {
    const {
        filter,
        filterType,
        value: initialValue,
        onValueChange,
        allowItemCreate = true,
        path,
        errorMsg,
        ...rest
    } = props;
    const [items, setItems] = useState<(string | ItemComponent)[]>([]);
    const [value, setValue] = useState<string | undefined>();
    const { rpcClient } = useVisualizerContext();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const result = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
            documentIdentifier: path,
            resourceType: filterType,
        });

        let workspaceItems: ItemComponent[] = [];
        let registryItems: ItemComponent[] = [];
        let initialItem: ItemComponent;
        if (result?.resources) {
            result.resources.forEach((resource) => {
                const item = { key: resource.name, item: getItemComponent(resource.name) };
                if (resource.name === initialValue) {
                    initialItem = item;
                    return;
                }
                workspaceItems.push(item);
            });
        }
        if (result?.registryResources) {
            result.registryResources.forEach((resource) => {
                const item = { key: resource.registryKey, item: getItemComponent(resource.registryKey, "reg:") };
                if (resource.registryKey === initialValue) {
                    initialItem = item;
                    return;
                }
                registryItems.push(item);
            });
        }

        let items: (string | ItemComponent)[] = [...workspaceItems, ...registryItems];

        // Add the initial value to the start of the list if provided
        if (!!initialValue && initialValue.length > 0) {
            items.unshift((initialItem || initialValue));
        }

        if (filter) {
            items = items.filter((item) => filter(getItemKey(item)));
        }
        setItems(items);
    };

    const handleValueChange = (val: string) => {
        setValue(val);
        onValueChange && onValueChange(val);
    };

    return (
        <Container>
            <AutoComplete
                {...rest}
                value={value || initialValue}
                onValueChange={handleValueChange}
                required={props.required}
                items={items}
                allowItemCreate={allowItemCreate}
                onCreateButtonClick={props.onCreateButtonClick ? () => {
                    handleValueChange("");
                    props.onCreateButtonClick(fetchItems, handleValueChange);
                } : null}
            />
            {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
        </Container>
    );
};

export const FormKeylookup = <T extends FieldValues>(props: IFormKeylookup<T>) => {
    const { control, name, ...rest } = props;
    const {
        field: { value, onChange },
    } = useController({ name, control });

    return <Keylookup {...rest} name={name} value={value} onValueChange={onChange} />;
};

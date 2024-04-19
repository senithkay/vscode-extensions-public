/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { AutoComplete, ItemComponent } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import styled from "@emotion/styled";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type FilterType =
    | "sequence"
    | "endpoint"
    | "messageStore"
    | "messageProcessor"
    | "task"
    | "sequenceTemplate"
    | "endpointTemplate";

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
    onValueChange?: (item: string, index?: number) => void;
    name?: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    // Document path
    path: string;
    // Artifact type to be fetched
    filterType: FilterType;
    // Callback to filter the fetched artifacts
    filter?: (value: string) => boolean;
}

export type IFormKeylookup<T extends FieldValues> = IKeylookup & UseControllerProps<T>;

// Styles
const ItemContainer = styled.div({
    display: "flex",
    alignItems: "center",
    gap: "4px",
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
    const { filter, filterType, onValueChange, allowItemCreate = true, path, ...rest } = props;
    const [items, setItems] = useState<ItemComponent[]>([]);
    const [value, setValue] = useState<string | undefined>(undefined);
    const { rpcClient } = useVisualizerContext();

    useEffect(() => {
        const fetchItems = async () => {
            const result = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: path,
                resourceType: filterType,
            });

            let workspaceItems: ItemComponent[];
            let registryItems: ItemComponent[];
            if (result?.resources) {
                workspaceItems = result.resources.map((resource) => ({
                    key: resource.name,
                    item: getItemComponent(resource.name),
                }));
            }
            if (result?.registryResources) {
                registryItems = result.registryResources.map((resource) => ({
                    key: resource.registryKey,
                    item: getItemComponent(resource.registryKey, "reg:"),
                }));
            }

            let items = [...workspaceItems, ...registryItems];
            if (filter) {
                items = items.filter((item) => filter(item.key));
            }
            setItems(items);
        };

        fetchItems();
    }, []);

    const handleValueChange = (val: string) => {
        setValue(val);
        onValueChange && onValueChange(val);
    };

    return (
        <AutoComplete
            {...rest}
            value={value}
            onValueChange={handleValueChange}
            items={items}
            allowItemCreate={allowItemCreate}
        />
    );
};

export const FormKeylookup = <T extends FieldValues>(props: IFormKeylookup<T>) => {
    const { control, name, ...rest } = props;
    const {
        field: { onChange },
    } = useController({ name, control });

    return <Keylookup {...rest} onValueChange={onChange} />;
};

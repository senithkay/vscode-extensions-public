/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { AutoComplete, ErrorBanner, getItemKey, ItemComponent, Typography } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import styled from "@emotion/styled";
import { VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { FieldValues, Path, useController, UseControllerProps } from "react-hook-form";
import { Colors } from "../../../resources/constants";

export type FilterType =
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
    | "yaml"
    | "registry";

// Interfaces
interface IKeylookupBase {
    // AutoComplete props
    id?: string;
    required?: boolean;
    notItemsFoundMessage?: string;
    widthOffset?: number;
    nullable?: boolean;
    allowItemCreate?: boolean;
    sx?: React.CSSProperties;
    borderBox?: boolean;
    errorMsg?: string;
    value?: string;
    onValueChange?: (item: string, index?: number) => void;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    // Document path
    path?: string;
    // Artifact type to be fetched
    filterType?: FilterType;
    // Callback to filter the fetched artifacts
    filter?: (value: string) => boolean;
    onCreateButtonClick?: (fetchItems: any, handleValueChange: any) => void;
    additionalItems?: string[];
}

// Define the conditional properties for the ExpressionField
type ExpressionFieldProps = {
    isExpression: true;
    isExActive: boolean;
    setIsExpression: (isExpr: boolean) => void;
    canChangeEx?: boolean
} | { 
    isExpression?: false | never;
    isExActive?: never;
    setIsExpression?: never;
    canChangeEx?: never
};

// Define the conditional properties
type ConditionalProps = 
    | { label: string; name: string; identifier?: never }
    | { label: string; name?: never; identifier?: never }
    | { label?: never; name: string; identifier?: never }
    | { label?: never; name?: never; identifier: string };

// Combine the base properties with conditional properties
export type IKeylookup = IKeylookupBase & ExpressionFieldProps & ConditionalProps;

export type IFormKeylookup<T extends FieldValues> = IKeylookupBase
    & { label?: string }
    & UseControllerProps<T>
    // Properties for the ExpressionField
    & ({ isExpression: true; canChangeEx?: boolean } | { isExpression?: false | never; canChangeEx?: never });

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

namespace ExBtn {
    export const Container = styled.div({
        display: "flex",
        alignItems: "center",
        backgroundColor: "inherit",
    });

    export const Wrapper = styled.div<{ isActive: boolean }>`
        padding: 3px;
        cursor: pointer;
        background-color: ${(props: { isActive: any; }) => props.isActive ? 
            Colors.INPUT_OPTION_ACTIVE : Colors.INPUT_OPTION_INACTIVE};
        border: 1px solid ${(props: { isActive: any; }) => props.isActive ?
            Colors.INPUT_OPTION_ACTIVE_BORDER : "transparent"};
        &:hover {
            background-color: ${(props: { isActive: any; }) => props.isActive ?
                Colors.INPUT_OPTION_ACTIVE : Colors.INPUT_OPTION_HOVER};
        }
`;
}

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
        isExpression,
        isExActive,
        setIsExpression,
        canChangeEx,
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

        let items: (string | ItemComponent)[] = [
            ...(props.additionalItems ? props.additionalItems : []),
            ...workspaceItems, ...registryItems];

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

    const ExButton = (props: { isActive: boolean; onClick: () => void }) => {
        return (
            <ExBtn.Container>
                <ExBtn.Wrapper isActive={props.isActive} onClick={props.onClick}>
                    <Typography sx={{ textAlign: "center", margin: 0 }} variant="h6">EX</Typography>
                </ExBtn.Wrapper>
            </ExBtn.Container>
        );
    }

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
                {...isExpression && { actionBtns: [
                    <ExButton
                        isActive={isExActive}
                        onClick={() => {
                            if (canChangeEx) {
                                setIsExpression(!isExActive);
                            }
                        }}
                    />
                ] }}
            />
            {errorMsg && <ErrorBanner errorMsg={errorMsg} />}
        </Container>
    );
};

export const FormKeylookup = <T extends FieldValues>(props: IFormKeylookup<T>) => {
    const { control, name, label, isExpression, canChangeEx = true, ...rest } = props;
    const {
        field: { value, onChange },
    } = useController({ name, control });
    
    if (isExpression) {
        const handleValueChange = (val: string) => {
            onChange({ ...value, value: val });
        }

        const handleExprChange = (isExpr: boolean) => {
            onChange({ ...value, isExpression: isExpr });
        }

        return (
            <Keylookup
                {...rest}
                name={name}
                label={label}
                value={value.value}
                onValueChange={handleValueChange}
                isExpression={true}
                isExActive={value.isExpression}
                setIsExpression={handleExprChange}
                canChangeEx={canChangeEx}
            />
        );
    }

    return <Keylookup {...rest} name={name} label={label} value={value} onValueChange={onChange} />;
};

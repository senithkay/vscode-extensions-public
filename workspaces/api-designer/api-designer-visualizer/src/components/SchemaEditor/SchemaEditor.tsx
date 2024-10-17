/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useRef, useState } from 'react';
import styled from "@emotion/styled";
import { Typography } from '@wso2-enterprise/ui-toolkit';

const GAP_BETWEEN_PROPERTIES = 2;
export interface Schema {
    type?: string;
    format?: string;
    properties?: { [propertyName: string]: Schema };
    items?: Schema;
    required?: string[];
    maximum?: number; // Added to handle "maximum" in schemas
    isArray?: boolean; // Added to handle arrays in schemas
    [key: string]: any; // To accommodate extensions and additional properties
}
export interface SchemaEditorProps {
    schema: Schema;
    schemaName: string;
    sx?: any;
}

interface SchemaEditorContainerProps {
    sx?: any;
    propertyGap?: number;
    height?: number;
}
const Container = styled.div<SchemaEditorContainerProps>`
    display: flex;
    flex-direction: column;
    gap: 15px;
    ${(props: SchemaEditorContainerProps) => props.sx};
`
const SchemaHeader = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    gap: 10px;
    align-items: center;
`
const SchemaContent = styled.div<SchemaEditorContainerProps>`
    display: flex;
    flex-direction: column;
    gap: ${(props: SchemaEditorContainerProps) => props.propertyGap}px;
`
const PropertyContainer = styled.div`
    display: flex;
    flex-direction: row;
`
const IconContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    gap: 5px;
    align-items: center;
    justify-content: flex-end;
    background-color: red;
`
const VeticalSeparator = styled.div<SchemaEditorContainerProps>`
    width: 1px;
    background-color: black;
    height: ${(props: SchemaEditorContainerProps) => props.height ?? 0}px;
`
const HorizontalSeparator = styled.div`
    height: 1px;
    width: 4px;
    background-color: black;
`
const HorizontalSeparatorContainer = styled.div`
    display: flex;
    align-items: center;
`
const PropertyContainerWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
`

export const SchemaEditor: React.FC<SchemaEditorProps> = (props: SchemaEditorProps) => {
    const { schema, schemaName, sx } = props;
    const [propContainerHeight, setPropContainerHeight] = useState(0);
    const propertyContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPropContainerHeight(propertyContainerRef.current?.clientHeight ?? 0);
    }, [schema]);

    return (
        <Container sx={sx}>
            <Typography variant="h3" sx={{ margin: 0 }}>{schemaName}</Typography>
            <SchemaContent propertyGap={GAP_BETWEEN_PROPERTIES}>
                <SchemaHeader>
                    <Typography variant="h4" sx={{ margin: 0 }}>Properties</Typography>
                    <IconContainer>
                        +
                        -
                    </IconContainer>
                </SchemaHeader>
                <PropertyContainer ref={propertyContainerRef}>
                    <VeticalSeparator height={propContainerHeight} />
                    <HorizontalSeparatorContainer>
                        <HorizontalSeparator />
                    </HorizontalSeparatorContainer>
                    <PropertyContainerWrapper>
                        <Typography variant="h4" sx={{ margin: 0 }}>string</Typography>
                    </PropertyContainerWrapper>
                </PropertyContainer>
            </SchemaContent>
        </Container>
    );
};

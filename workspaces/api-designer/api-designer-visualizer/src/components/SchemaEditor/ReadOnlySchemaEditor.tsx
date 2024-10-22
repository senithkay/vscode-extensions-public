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
import { Typography, TextField, Dropdown } from '@wso2-enterprise/ui-toolkit';

export interface Schema {
    $schema?: string;
    $id?: string;
    title?: string;
    description?: string;
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null' | ('string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null')[];
    properties?: { [propertyName: string]: Schema };
    items?: Schema | Schema[];
    required?: string[];
    enum?: any[];
    const?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxContains?: number;
    minContains?: number;
    maxProperties?: number;
    minProperties?: number;
    allOf?: Schema[];
    anyOf?: Schema[];
    oneOf?: Schema[];
    not?: Schema;
    if?: Schema;
    then?: Schema;
    else?: Schema;
    format?: string;
    contentMediaType?: string;
    contentEncoding?: string;
    definitions?: { [key: string]: Schema };
    $ref?: string;
    [key: string]: any; // For custom keywords and extensions
}

export interface SchemaEditorProps {
    schema: Schema;
    schemaName: string;
    variant?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    sx?: any;
}

interface SchemaEditorContainerProps {
    sx?: any;
    propertyGap?: number;
    height?: number;
}

const SchemaEditorContainer = styled.div<SchemaEditorContainerProps>`
    padding: 10px;
`;

const PropertyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
`;


const SchemaProperties: React.FC<{ properties: { [key: string]: Schema }, onUpdate: (updatedProperties: { [key: string]: Schema }) => void }> = ({ properties, onUpdate }) => {
    const [localProperties, setLocalProperties] = useState(properties);
    const [newPropertyKey, setNewPropertyKey] = useState<string | null>(null);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        setLocalProperties(properties);
    }, [properties]);

    useEffect(() => {
        if (newPropertyKey && inputRefs.current[newPropertyKey]) {
            inputRefs.current[newPropertyKey]?.focus();
            setNewPropertyKey(null);
        }
    }, [newPropertyKey]);

    const handlePropertyChange = (oldKey: string, newKey: string, newValue: Schema) => {
        const updatedProperties = { ...localProperties };
        if (oldKey !== newKey) {
            const entries = Object.entries(updatedProperties);
            const index = entries.findIndex(([key]) => key === oldKey);
            if (index !== -1) {
                entries.splice(index, 1, [newKey, newValue]);
                const reorderedProperties = Object.fromEntries(entries);
                setLocalProperties(reorderedProperties);
                onUpdate(reorderedProperties);
            }
        } else {
            updatedProperties[newKey] = newValue;
            setLocalProperties(updatedProperties);
            onUpdate(updatedProperties);
        }
    };

    return (
        <PropertyWrapper>
            {Object.entries(localProperties).map(([key, value]) => (
                <div key={key}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Typography variant="body2" sx={{fontWeight: "bold"}}>{key}</Typography>
                        <Typography variant="body2" sx={{fontWeight: "lighter"}}>{value?.type}</Typography>
                    </div>
                    {value.type === 'object' && value.properties && (
                        <div style={{ marginLeft: '20px', marginTop: 5 }}>
                            <SchemaProperties
                                properties={value.properties}
                                onUpdate={(updatedProperties) => handlePropertyChange(key, key, { ...value, properties: updatedProperties })}
                            />
                        </div>
                    )}
                    {value.type === 'array' && value.items && (
                        <div style={{ marginLeft: '20px', marginTop: 3 }}>
                            {Array.isArray(value.items) ? (
                                value.items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '10px' }}>
                                        <Typography variant="body2">Item {index + 1}</Typography>
                                        <ReadOnlySchemaEditor
                                            schema={item}
                                            schemaName={`${key}[${index}]`}
                                        />
                                    </div>
                                ))
                            ) : (
                                <ReadOnlySchemaEditor
                                    schema={value.items}
                                    schemaName={`Items`}
                                    variant="h4"
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </PropertyWrapper>
    );
};

export const ReadOnlySchemaEditor: React.FC<SchemaEditorProps> = (props: SchemaEditorProps) => {
    const { schema: initialSchema, schemaName, sx, variant = 'h4' } = props;
    const [schema, setSchema] = useState<Schema>(initialSchema);

    const handleSchemaUpdate = (updatedProperties: { [key: string]: Schema }) => {
        const updatedSchema = {
            ...schema,
            properties: updatedProperties
        };
        setSchema(updatedSchema);
    };

    useEffect(() => {
        // Update the schema when the initial schema changes
        setSchema(initialSchema);
    }, [initialSchema]);

    return (
        <SchemaEditorContainer sx={sx} key={schemaName}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Typography variant={"h3"} sx={{ margin: 0, fontWeight: "bold" }}>{schemaName}</Typography>
                {schema.type && <Typography variant={variant} sx={{ margin: "0 0 0 10px", fontWeight: "lighter" }}>{`<${schema.type}>`}</Typography>}
            </div>
            {schema.type === 'object' && schema.properties && (
                <SchemaProperties properties={schema.properties} onUpdate={handleSchemaUpdate} />
            )}
            {schema.type === 'array' && schema.items && (
                <div style={{ marginLeft: '20px' }}>
                    <ReadOnlySchemaEditor
                        schema={Array.isArray(schema.items) ? schema.items[0] : schema.items}
                        schemaName="Array Items"
                        variant="h5"
                    />
                </div>
            )}
        </SchemaEditorContainer>
    );
};



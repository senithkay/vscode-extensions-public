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
import { Typography, TextField, Button, Codicon, Dropdown } from '@wso2-enterprise/ui-toolkit';
import { SchemaTypes } from '../../constants';


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
    onSchemaChange: (updatedSchema: Schema) => void;
}

interface SchemaEditorContainerProps {
    sx?: any;
    propertyGap?: number;
    height?: number;
}

const SchemaEditorContainer = styled.div<SchemaEditorContainerProps>`
    padding: 10px;
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

    const handlePropertyTypeChange = (key: string, newType: Schema['type']) => {
        const updatedProperties = { ...localProperties };
        const currentProperty = updatedProperties[key];

        const updatedProperty: Schema = {
            ...currentProperty,
            type: newType,
        };

        if (newType === 'array') {
            updatedProperty.items = { type: 'string' };
            delete updatedProperty.properties;
        } else if (newType === 'object') {
            updatedProperty.properties = updatedProperty.properties || {};
            delete updatedProperty.items;
        } else {
            delete updatedProperty.items;
            delete updatedProperty.properties;
        }

        updatedProperties[key] = updatedProperty;
        setLocalProperties(updatedProperties);
        onUpdate(updatedProperties);
    };

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

    const handleAddProperty = (key: string) => {
        const newKey = `property${Object.keys(localProperties[key].properties || {}).length + 1}`;
        const newProperties = {
            ...(localProperties[key].properties || {}),
            [newKey]: { type: 'string' as const }
        };
        handlePropertyChange(key, key, { ...localProperties[key], properties: newProperties });
    };

    const handleDeleteProperty = (keyToDelete: string) => {
        const updatedProperties = { ...localProperties };
        delete updatedProperties[keyToDelete];
        setLocalProperties(updatedProperties);
        onUpdate(updatedProperties);
    };

    return (
        <div>
            {Object.entries(localProperties).map(([key, value]) => (
                <div key={key}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <TextField
                            value={key}
                            sx={{ width: '12em' }}
                            onBlur={(e) => handlePropertyChange(key, e.target.value, value)}
                            ref={(el) => inputRefs.current[key] = el}
                        />
                        <Dropdown
                            id={key}
                            value={value.type}
                            sx={{ width: '12em' }}
                            items={SchemaTypes.map((type) => ({ id: type, content: type, value: type }))}
                            onChange={(e) => handlePropertyTypeChange(key, e.target.value as Schema['type'])}
                        />
                        <TextField
                            value={value.description || ''}
                            placeholder="Description"
                            sx={{ width: '20em' }}
                            onBlur={(e) => handlePropertyChange(key, key, { ...value, description: e.target.value })}
                        />
                        <Button
                            appearance='icon'
                            onClick={() => handleDeleteProperty(key)}
                        >
                            <Codicon name='trash' sx={{ marginTop: '2px' }} />
                        </Button>
                        {value.type === 'object' && (
                            <Button
                                appearance='icon'
                                onClick={() => {
                                    handleAddProperty(key);
                                }}
                            >
                                <Codicon name='plus' sx={{ marginTop: '2px' }} />
                            </Button>
                        )}
                    </div>
                    {value.type === 'object' && value.properties && (
                        <div style={{ marginLeft: '20px' }}>
                            <SchemaProperties
                                properties={value.properties}
                                onUpdate={(updatedProperties) => handlePropertyChange(key, key, { ...value, properties: updatedProperties })}
                            />
                        </div>
                    )}
                    {value.type === 'array' && value.items && (
                        <div style={{ marginLeft: '20px' }}>
                            {Array.isArray(value.items) ? (
                                value.items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '10px' }}>
                                        <Typography variant="body2">Item {index + 1}</Typography>
                                        <SchemaEditor
                                            schema={item}
                                            schemaName={`${key}[${index}]`}
                                            onSchemaChange={(updatedItemSchema) => {
                                                const updatedItems = Array.isArray(value.items) ? [...value.items] : [value.items];
                                                updatedItems[index] = updatedItemSchema;
                                                handlePropertyChange(key, key, { ...value, items: updatedItems });
                                            }}
                                        />
                                    </div>
                                ))
                            ) : (
                                <SchemaEditor
                                    schema={value.items}
                                    schemaName={`Items`}
                                    variant="h4"
                                    onSchemaChange={(updatedItemSchema) => {
                                        handlePropertyChange(key, key, { ...value, items: updatedItemSchema });
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export const SchemaEditor: React.FC<SchemaEditorProps> = (props: SchemaEditorProps) => {
    const { schema: initialSchema, schemaName, sx, onSchemaChange, variant = 'h4' } = props;
    const [schema, setSchema] = useState<Schema>(initialSchema);

    const handleSchemaUpdate = (updatedProperties: { [key: string]: Schema }) => {
        const updatedSchema = {
            ...schema,
            properties: updatedProperties
        };
        setSchema(updatedSchema);
        onSchemaChange(updatedSchema);
    };

    const handleAddProperty = () => {
        const newKey = `property${Object.keys(schema.properties || {}).length + 1}`;
        const newProperties = {
            ...(schema.properties || {}),
            [newKey]: { type: 'string' as const }
        };
        const updatedSchema = {
            ...schema,
            properties: newProperties
        };
        setSchema(updatedSchema);
        onSchemaChange(updatedSchema);
    };

    const handleTypeChange = (newType: Schema['type']) => {
        const updatedSchema: Schema = {
            ...schema,
            type: newType,
            properties: newType === 'object' ? schema.properties || {} : undefined,
            items: newType === 'array' ? { type: 'string' } : undefined
        };
        setSchema(updatedSchema);
        onSchemaChange(updatedSchema);
    };

    return (
        <SchemaEditorContainer sx={sx}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Typography variant={variant} sx={{ margin: 0 }}>{schemaName}</Typography>
                <Dropdown
                    id={`${schemaName}-type`}
                    value={schema.type}
                    sx={{ width: '12em', marginLeft: '10px' }}
                    items={SchemaTypes.map((type) => ({ id: type, content: type, value: type }))}
                    onChange={(e) => handleTypeChange(e.target.value as Schema['type'])}
                />
                {schema.type === 'object' && (
                    <Button
                        appearance='icon'
                        onClick={handleAddProperty}
                        sx={{ marginLeft: '10px' }}
                    >
                        <Codicon name='plus' sx={{ marginTop: '2px' }} />
                    </Button>
                )}
            </div>
            {schema.type === 'object' && schema.properties && (
                <SchemaProperties properties={schema.properties} onUpdate={handleSchemaUpdate} />
            )}
            {schema.type === 'array' && schema.items && (
                <div style={{ marginLeft: '20px' }}>
                    <SchemaEditor
                        schema={Array.isArray(schema.items) ? schema.items[0] : schema.items}
                        schemaName="Array Items"
                        variant="h5"
                        onSchemaChange={(updatedItemSchema) => {
                            const updatedSchema = {
                                ...schema,
                                items: updatedItemSchema
                            };
                            setSchema(updatedSchema);
                            onSchemaChange(updatedSchema);
                        }}
                    />
                </div>
            )}
        </SchemaEditorContainer>
    );
};



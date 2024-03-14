/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, Dropdown, TextField, Codicon } from "@wso2-enterprise/ui-toolkit";

const PropertiesTable = ({ properties, setProperties }: any) => {
    const scopes = [
        { content: 'Default', value: 'default' },
        { content: 'Transport', value: 'transport' },
        { content: 'Axis2', value: 'axis2' },
        { content: 'Axis2-Client', value: 'axis2-client' },
    ];

    const handlePropertyChange = (index: number, field: string, value: string) => {
        const newProperties = [...properties];
        newProperties[index] = { ...newProperties[index], [field]: value };
        setProperties(newProperties);
    }

    const handlePropertyDelete = (index: number) => {
        const newProperties = [...properties];
        newProperties.splice(index, 1);
        setProperties(newProperties);
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: "15px 30px",
                border: "1px solid #e0e0e0",
                borderRadius: "5px",
                marginTop: 20,
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr 0.2fr',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                    padding: '10px 0',
                    borderBottom: "1px solid #e0e0e0",
                }}>
                    <span style={{ textAlign: 'center' }}>Name</span>
                    <span style={{ textAlign: 'center' }}>Value</span>
                    <span style={{ textAlign: 'center' }}>Scope</span>
                    <span style={{ textAlign: 'center' }}>Remove</span>
                </div>
                {properties.length > 0 ? properties.map((property: any, index: number) => (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 0.2fr',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 20,
                        paddingBottom: (index === properties.length - 1) ? 0 : 10,
                        borderBottom: (index === properties.length - 1) ? 0 : "1px solid #e0e0e0",
                    }}>
                        <TextField
                            id='property-name'
                            value={property.name}
                            placeholder="Property name"
                            onChange={(text: string) => handlePropertyChange(index, "name", text)}
                            sx={{ marginTop: '-2px' }}
                        />
                        <TextField
                            id='property-value'
                            value={property.value}
                            placeholder="Property value"
                            onChange={(text: string) => handlePropertyChange(index, "value", text)}
                            sx={{ marginTop: '-2px' }}
                        />
                        <Dropdown
                            id="property-scope"
                            value={property.scope}
                            onChange={(text: string) => handlePropertyChange(index, "scope", text)}
                            items={scopes}
                        />
                        <Codicon iconSx={{ fontSize: 18 }} name='trash' onClick={() => handlePropertyDelete(index)} />
                    </div>
                )) : (
                    <p style={{
                        margin: "10px 0",
                    }}>No Properties to display</p>
                )}
            </div>
        </div>
    )
}

export default PropertiesTable;

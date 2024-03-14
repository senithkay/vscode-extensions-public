/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import Endpoint from "./Endpoint";

const EndpointList = ({ endpoints, setEndpoints }: any) => {
    
    const handleEndpointsChange = (index: number, endpoint: any) => {
        const newEndpoints = [...endpoints];
        newEndpoints[index] = { ...endpoint };
        setEndpoints(newEndpoints);
    }

    const onEndpointDelete = (index: number) => {
        const newEndpoints = [...endpoints];
        newEndpoints.splice(index, 1);
        setEndpoints(newEndpoints);
    }

    return (
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
                gridTemplateColumns: '1fr 4fr',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                padding: '10px 0',
                borderBottom: "1px solid #e0e0e0",
            }}>
                <span>Type</span>
                <span>Value</span>
            </div>
            {endpoints.length > 0 ? endpoints.map((endpoint: any, index: number) => (
                <Endpoint
                    key={index}
                    endpoint={endpoint}
                    handleEndpointChange={handleEndpointsChange}
                    onDeleteClick={onEndpointDelete}
                    index={index}
                    last={endpoints.length - 1}
                />
            )) : (
                <p style={{
                    margin: "10px 0",
                }}>No Endpoints to display</p>
            )}
        </div>
    )
}

export default EndpointList;

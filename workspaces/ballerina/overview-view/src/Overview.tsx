/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client"
// import { WebViewAPI } from './WebViewAPI';

import { ComponentListView } from './ComponentListView';
import { TitleBar } from './components/TitleBar';

export function Overview() {
    const [currentComponents, setCurrentComponents] = useState<any>();
    const [loading, setLoading] = useState(true);
    const { rpcClient } = useVisualizerContext();

    const [isPanelOpen, setPanelOpen] = useState(false);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };


    const fetchData = async () => {
        try {
            const res = await rpcClient.getLangServerRpcClient().getBallerinaProjectComponents(undefined);
            setCurrentComponents(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        // Render a loading indicator
        return <div>Loading...</div>;
    }

    return (
        <>
            <TitleBar />
            {currentComponents ? (
                <ComponentListView currentComponents={currentComponents} />
            ) : (
                <div>No data available</div>
            )}
        </>
    );
}

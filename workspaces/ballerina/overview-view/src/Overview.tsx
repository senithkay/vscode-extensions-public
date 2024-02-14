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

import { ComponentListView } from './ComponentListView';
import { TitleBar } from './components/TitleBar';

// Create a interface for the data
interface Data {
    packages: Package[];
}
// Create a interface for the package
interface Package {
    name: string;
    filePath: string;
    modules: Module[];
}
// Create a interface for the module
interface Module {
    functions: any[];
    services: any[];
    records: any[];
    objects: any[];
    classes: any[];
    types: any[];
    constants: any[];
    enums: any[];
    listeners: any[];
    moduleVariables: any[];
}

export function Overview() {
    const [components, setComponents] = useState<Data>();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const { rpcClient } = useVisualizerContext();

    const [isPanelOpen, setPanelOpen] = useState(false);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };

    const handleSearch = (value: string) => {
        setQuery(value);
    };

    const fetchData = async () => {
        try {
            const res = await rpcClient.getLangServerRpcClient().getBallerinaProjectComponents(undefined);
            setComponents(res as Data);
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

    // Filter the components based on the search query
    const filteredComponents = components?.packages.map((pkg) => {
        const modules = pkg.modules.map((module) => {
            const services = module.services.filter((service) => {
                return service.name.toLowerCase().includes(query.toLowerCase());
            });
            const types = module.types.filter((type) => {
                return type.name.toLowerCase().includes(query.toLowerCase());
            });
            const functions = module.functions.filter((func) => {
                return func.name.toLowerCase().includes(query.toLowerCase());
            });
            const records = module.records.filter((record) => {
                return record.name.toLowerCase().includes(query.toLowerCase());
            });
            const objects = module.objects.filter((object) => {
                return object.name.toLowerCase().includes(query.toLowerCase());
            });
            const classes = module.classes.filter((cls) => {
                return cls.name.toLowerCase().includes(query.toLowerCase());
            });
            const constants = module.constants.filter((constant) => {
                return constant.name.toLowerCase().includes(query.toLowerCase());
            });
            const enums = module.enums.filter((enumType) => {
                return enumType.name.toLowerCase().includes(query.toLowerCase());
            });
            const listeners = module.listeners.filter((listener) => {
                return listener.name.toLowerCase().includes(query.toLowerCase());
            });
            const moduleVariables = module.moduleVariables.filter((variable) => {
                return variable.name.toLowerCase().includes(query.toLowerCase());
            });
            return {
                ...module,
                services,
                types,
                functions,
                records,
                objects,
                classes,
                constants,
                enums,
                listeners,
                moduleVariables,
            };
        });
        return {
            ...pkg,
            modules,
        };
    });

    return (
        <>
            <TitleBar query={query} onQueryChange={handleSearch}/>
            {components ? (
                <ComponentListView currentComponents={{packages: filteredComponents}} />
            ) : (
                <div>No data available</div>
            )}
        </>
    );
}

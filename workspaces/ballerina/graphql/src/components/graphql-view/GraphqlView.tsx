/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from "graphql";
import "graphiql/graphiql.css";
import "./style.css";


declare const acquireVsCodeApi: () => {
    postMessage(message: any): void;
    getConfiguration(): {
        get(key: string): string | undefined;
    };
};

// Initialize vscode API safely
const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

interface Request {
    url: string,
    headers: any,
    method: string,
    body?: string,
}

function fetcher(api: string, body: Object, headers: string | undefined): Promise<any> {
    const request: Request = {
        url: api,
        method: "POST",
        headers: JSON.parse(headers ?? ''),
        body: JSON.stringify(body),
    }

    vscode?.postMessage({
        command: 'graphqlRequest',
        req: request
    });

    return new Promise(resolve => {
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'graphqlResponse':
                    if (!message.res) {
                        resolve(false);
                    }
                    resolve(message.res);
            }
        })
    });
}

export const GraphqlView = (props: any) => {
    const serviceAPI: string = props.data.serviceAPI;

    const [query, setQuery] = useState<string | undefined>('');
    const [schema, setSchema] = useState<GraphQLSchema | null>();
    const [showExplorer, setShowExplorer] = useState(false);
    const [headers, setHeaders] = useState<string | undefined>(JSON.stringify({
        "Content-Type": "application/json",
    }));

    // Get VSCode theme
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Set the theme from the vscode theme
        setTheme(document.body.classList.contains('vscode-dark') ? 'dark' : 'light');
    }, []);

    useEffect(() => {
        fetcher(serviceAPI, { query: getIntrospectionQuery() }, headers)
            .then(result => {
                setSchema(buildClientSchema(result.data));
            });
    }, []);

    const _handleEditQuery = (query?: string): void => setQuery(query);
    const _handleEditHeaders = (headers?: string): void => setHeaders(headers);
    const _handleToggleExplorer = (): void => setShowExplorer(!showExplorer);
    const _fetcher = (params: Object) => {
        return fetcher(serviceAPI, params, headers);
    };

    return (
        <div className="graphiql-container">
            <GraphiQLExplorer
                schema={schema}
                query={query}
                onEdit={_handleEditQuery}
                explorerIsOpen={showExplorer}
                onToggleExplorer={_handleToggleExplorer}
                defaultTheme={theme}
            />
            <GraphiQL
                fetcher={_fetcher}
                schema={schema}
                headers={headers}
                query={query}
                onEditQuery={_handleEditQuery}
                onEditHeaders={_handleEditHeaders}
                onTogglePluginVisibility={_handleToggleExplorer}
                defaultEditorToolsVisibility={true}
                forcedTheme={theme}
            >
                <GraphiQL.Logo>
                    <div></div>
                </GraphiQL.Logo>
            </GraphiQL>
        </div>
    );
};

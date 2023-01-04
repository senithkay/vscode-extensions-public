/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useEffect, useState } from 'react';
import GraphiQL from "graphiql";
import GraphiQLExplorer from "graphiql-explorer";
import { buildClientSchema, getIntrospectionQuery, GraphQLSchema } from "graphql";
import "graphiql/graphiql.css";
import "./style.css";

declare const vscode: vscode;
interface vscode {
    postMessage(message: any): void;
}

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

    vscode.postMessage({
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
    let _graphiql;

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
            />
            <GraphiQL
                ref={ref => (_graphiql = ref!)}
                fetcher={_fetcher}
                headers={headers}
                query={query}
                onEditQuery={_handleEditQuery}
                onEditHeaders={_handleEditHeaders}
            >
                <GraphiQL.Logo>
                    <div></div>
                </GraphiQL.Logo>

                <GraphiQL.Toolbar>
                    <GraphiQL.Button
                        onClick={() => { _graphiql.ref.props.prettify() }}
                        label="Prettify"
                        title="Prettify Query (Shift-Ctrl-P)"
                    />
                    <GraphiQL.Button
                        onClick={() => { _graphiql.ref.props.historyContext.toggle() }}
                        label="History"
                        title="Show History"
                    />
                    <GraphiQL.Button
                        onClick={_handleToggleExplorer}
                        label="Explorer"
                        title="Toggle Explorer"
                    />
                </GraphiQL.Toolbar>
            </GraphiQL>
        </div>);

};

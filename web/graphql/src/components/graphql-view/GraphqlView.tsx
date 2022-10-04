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

function fetcher(params: Object): Promise<any> {
    return fetch(
        "https://api.spacex.land/graphql/",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        }
    )
        .then(function (response) {
            return response.text();
        })
        .then(function (responseBody) {
            try {
                return JSON.parse(responseBody);
            } catch (e) {
                return responseBody;
            }
        });
}

export const GraphqlView = (props: any) => {
    // const file: string | undefined = props.data.file;
    // const serviceName: string | undefined = props.data.serviceName;
    // const proxy: string | undefined = props.data.proxy;
    // let response: Response;
    const [query, setQuery] = useState<string | undefined>('');
    const [schema, setSchema] = useState<GraphQLSchema | null>();
    const [showExplorer, setShowExplorer] = useState(false);
    let _graphiql;

    useEffect(() => {
        fetcher({
            query: getIntrospectionQuery()
        }).then(result => {
            setSchema(buildClientSchema(result.data));
        });
    }, []);

    const _handleEditQuery = (query?: string): void => setQuery(query);
    const _handleToggleExplorer = (): void => setShowExplorer(!showExplorer);

    return (
        <div className="graphiql-container">
            <GraphiQLExplorer
                schema={schema}
                query={query}
                onEdit={_handleEditQuery}
                // onRunOperation={operationName =>
                //     this._graphiql.handleRunQuery(operationName)
                // }
                explorerIsOpen={showExplorer}
            // onToggleExplorer={this._handleToggleExplorer}
            // getDefaultScalarArgValue={getDefaultScalarArgValue}
            // makeDefaultArg={makeDefaultArg}
            />
            <GraphiQL
                ref={ref => (_graphiql = ref!)}
                fetcher={fetcher}
                schema={schema}
                query={query}
                onEditQuery={_handleEditQuery}
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

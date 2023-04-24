/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-lambda  jsx-no-multiline-js
import  * as React from 'react';

import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import "reflect-metadata";
import { container, injectable, singleton } from "tsyringe";

import { useDMSearchStore } from '../../../../store/store';
import { IDataMapperNodeFactory } from '../commons/DataMapperNode';

import {
    SearchNode,
    SearchType,
    SEARCH_NODE_TYPE
} from './SearchNode';
import { SearchNodeWidget } from "./SearchNodeWidget";

@injectable()
@singleton()
export class SearchNodeFactory extends AbstractReactFactory<SearchNode, DiagramEngine> implements IDataMapperNodeFactory {
    constructor() {
        super(SEARCH_NODE_TYPE);
    }

    generateReactWidget(event: { model: SearchNode; }): JSX.Element {
        const dmStore = useDMSearchStore.getState();
        if (event.model.type === SearchType.Input){
            return (
                <SearchNodeWidget
                    searchText={dmStore.inputSearch}
                    onSearchTextChange={dmStore.setInputSearch}
                    focused={dmStore.inputSearchFocused}
                    setFocused={dmStore.setInputSearchFocused}
                    searchType={SearchType.Input}
                />
             );
        } else if (event.model.type === SearchType.Output){
            return (
                <SearchNodeWidget
                    searchText={dmStore.outputSearch}
                    onSearchTextChange={dmStore.setOutputSearch}
                    focused={dmStore.outputSearchFocused}
                    setFocused={dmStore.setOutputSearchFocused}
                    searchType={SearchType.Output}
                />
             );
        }
        return null;
    }

    generateModel(): SearchNode {
        return undefined;
    }
}

container.register("NodeFactory", {useClass: SearchNodeFactory});

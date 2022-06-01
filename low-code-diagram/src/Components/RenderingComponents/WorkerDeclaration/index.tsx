/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

import { NamedWorkerDeclaration } from '@wso2-enterprise/syntax-tree';

import { BlockViewState } from '../../../ViewState';
import { End } from '../End';
import { WorkerBody } from '../WorkerBody';
import { WorkerLine } from '../WorkerLine';

import './style.scss';
import { WorkerHead } from './WorkerHead';

interface WorkerProps {
    model: NamedWorkerDeclaration;
}

export function Worker(props: WorkerProps) {
    const { model } = props;
    const workerBodyVS: BlockViewState = model.workerBody.viewState as BlockViewState;

    return (
        <g id={`worker-${model.workerName.value}`} className={'worker-body'}>
            <WorkerLine viewState={model.viewState} />
            <WorkerHead model={model} />
            <WorkerBody model={model.workerBody} viewState={workerBodyVS} />
            {!workerBodyVS.isEndComponentAvailable && <End viewState={model.viewState.end} />}
        </g>
    )
}

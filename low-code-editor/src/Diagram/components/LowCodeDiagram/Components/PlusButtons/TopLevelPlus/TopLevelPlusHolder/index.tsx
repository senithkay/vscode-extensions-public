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

import { Divider } from '@material-ui/core';
import { getConstructIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import classNames from 'classnames';

import { CustomStatementIcon } from '../../../../../../../assets/icons';
import { PlusMenuCategories, PlusMenuEntry } from '../PlusOptionsSelector';

import './style.scss';

interface TopLevelPlusHolderProps {
    entries: PlusMenuEntry[];
    onOptionSelect: (entry: PlusMenuEntry) => void;
}

export function TopLevelPlusHolder(props: TopLevelPlusHolderProps) {

    const { entries, onOptionSelect } = props;

    const entryPoints: JSX.Element[] = [];
    const constructs: JSX.Element[] = [];

    entries.forEach(entry => {

        const onEntryClick = () => {
            onOptionSelect(entry);
        }

        switch (entry.category) {
            case PlusMenuCategories.CONSTRUCT:
                constructs.push((
                    <div
                        className={classNames("sub-option enabled", { height: 'unset' })}
                        data-testid="addcustom"
                        onClick={onEntryClick}
                    >
                        <div className="icon-wrapper">
                            {getConstructIcon(entry.type)}
                        </div>
                        <div className="text-label">{entry.name}</div>
                    </div>
                ));
                break;
            case PlusMenuCategories.ENTRY_POINT:
                entryPoints.push((
                    <div
                        className={classNames("sub-option enabled", { height: 'unset' })}
                        data-testid="addcustom"
                        onClick={onEntryClick}
                    >
                        <div className="icon-wrapper">
                            {getConstructIcon(entry.type)}
                        </div>
                        <div className="text-label">{entry.name}</div>
                    </div>
                ));
                break;
        }
    })

    return (
        <div className="plus-holder">
            <div className="holder-wrapper">
                <div className="element-options">
                    <div className="element-option-holder" >
                        <div className='options-wrapper'>
                            {entryPoints}
                        </div>
                        {entryPoints.length > 0 && constructs.length > 0 && <Divider />}
                        <div className='options-wrapper'>
                            {constructs}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

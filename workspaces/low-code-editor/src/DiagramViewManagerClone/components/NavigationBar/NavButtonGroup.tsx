/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import React from "react";

import { ArrowBack, HomeOutlined } from "@material-ui/icons";

import { useHistoryContext } from "../../context/history";
import { extractFilePath } from "../../utils";

interface NavButtonGroupProps {
    currentProjectPath: string;
}

export function NavButtonGroup(props: NavButtonGroupProps) {
    const { currentProjectPath } = props;
    const { history, historyPop, historyClearAndPopulateWith } = useHistoryContext();

    const buttonsEnabled = history.length > 1;

    const handleBackButtonClick = () => {
        if (buttonsEnabled) {
            historyPop();
        }
    }

    const handleHomeButtonClick = () => {
        if (!buttonsEnabled) {
            historyClearAndPopulateWith({
                file: extractFilePath(currentProjectPath)
            });
        }
    }

    return (
        <>
            <div
                className="btn-container"
                aria-disabled={!buttonsEnabled}
                onClick={handleBackButtonClick}
            >
                <ArrowBack className={!buttonsEnabled ? 'is-disabled' : ''} />
            </div>
            <div
                className="btn-container"
                aria-disabled={!buttonsEnabled}
                onClick={handleHomeButtonClick}
            >
                <HomeOutlined />
            </div>
        </>
    );
}

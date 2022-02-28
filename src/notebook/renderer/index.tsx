/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { h, render } from 'preact';
import { ActivationFunction, OutputItem, RendererContext } from 'vscode-notebook-renderer';
import { MIME_TYPE_TABLE } from './constants';
import { Table } from './table';

export const activate: ActivationFunction = (context: RendererContext<any>) => ({
	renderOutputItem(data: OutputItem, element) {
		try {
			switch (data.mime) {
				case MIME_TYPE_TABLE:
					render(<Table shellOutput={data.json()}/>, element);
					break;
				default:
					break;
			}
		} catch {
			render(<p>Error!</p>, element);
		}
	}
});

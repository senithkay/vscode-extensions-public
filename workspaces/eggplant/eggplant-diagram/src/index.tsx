/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';

import { BodyWidget } from './components/layout/BodyWidget';
import { App } from './App';

export type { Model } from './types/types';

export default () => {
	var app = new App();
	return <BodyWidget app={app} />;
};

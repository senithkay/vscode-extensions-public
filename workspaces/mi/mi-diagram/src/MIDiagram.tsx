/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { MIWebViewAPI } from './utils/WebViewRpc';
import { APICompartment } from './components/compartments/APICompartment';
import { ResourceCompartment } from './components/compartments/ResourceCompartment';
import { Refresh } from '@wso2-enterprise/mi-core';
import { SidePanelProvider } from './components/sidePanel/SidePanelContexProvider';
import { Button } from '@wso2-enterprise/ui-toolkit';
import { SidePanel, SidePanelTitleContainer } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './components/sidePanel';

export interface MIDiagramProps {
	documentUri: string;
}

export function MIDiagram(props: MIDiagramProps) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [lastUpdated, setLastUpdated] = useState<number>(0);
	const [stNode, setSTNode] = useState<number>(0);
	const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
	const [nodePosition, setSidePanelNodePosition] = useState<number>();

	MIWebViewAPI.getInstance().getMessenger().onNotification(Refresh, () => {
		setLastUpdated(Date.now());
	});

	useEffect(() => {
		setLoading(true);

		(async () => {
			const st = await MIWebViewAPI.getInstance().getSyntaxTree(props.documentUri);
			const stNode = (st as any).syntaxTree.node;
			setSTNode(stNode);
			setLoading(false);
		})();
	}, [lastUpdated]);

	const closePanel = () => {
		setSidePanelOpen(false);
	};

	let canvas;
	if (isLoading) {
		canvas = <h1>Loading...</h1>;
	} else {
		canvas = stNode &&
			<div>
				<SidePanelProvider value={{ setIsOpen: setSidePanelOpen, setNodePosition: setSidePanelNodePosition }}>
					{isSidePanelOpen && <SidePanel
						isOpen={isSidePanelOpen}
						alignmanet="right"
					>
						<SidePanelTitleContainer>
							<div>Add Mediator</div>
							<Button onClick={closePanel} appearance="icon">X</Button>
						</SidePanelTitleContainer>
						<SidePanelList nodePosition={nodePosition} documentUri={props.documentUri} />
					</SidePanel>}
					<APICompartment name='API'>
						<ResourceCompartment name='Resource' stNode={stNode} documentUri={props.documentUri} />
					</APICompartment>
				</SidePanelProvider>
			</div >
			;
	}

	return (
		<>
			{canvas}
		</>
	);
}

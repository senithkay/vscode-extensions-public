/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
// import MIWebViewAPI from './utils/WebViewRpc';
import { ResourceCompartment } from './components/compartments/ResourceCompartment';
// import { Refresh } from '@wso2-enterprise/mi-core';
import { SidePanelProvider } from './components/sidePanel/SidePanelContexProvider';
import { Button } from '@wso2-enterprise/ui-toolkit';
import { SidePanel, SidePanelTitleContainer } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './components/sidePanel';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

export interface MIDiagramProps {
	documentUri: string;
}

export function MIDiagram(props: MIDiagramProps) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [lastUpdated, setLastUpdated] = useState<number>(0);
	const [stNode, setSTNode] = useState<number>(0);
	const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [sidePanelnodeRange, setSidePanelNodeRange] = useState<Range>();
	const [sidePanelMediator, setSidePanelMediator] = useState<string>();
	const [sidePanelFormValues, setSidePanelFormValues] = useState<{ [key: string]: any }>();
	const [sidePanelShowBackBtn, setSidePanelShowBackBtn] = useState<boolean>(false);
	const [sidePanelBackBtn, setSidePanelBackBtn] = useState<number>(0);
	const { rpcClient } = useVisualizerContext();
	// MIWebViewAPI.getInstance().refresh().onNotification(Refresh, () => {
	// 	setLastUpdated(Date.now());
	// });

	const incrementCount = () => {
		setSidePanelBackBtn(sidePanelBackBtn + 1);
	};

	useEffect(() => {
		setLoading(true);
		setLastUpdated(0);

		(async () => {
			const st = await rpcClient.getMiDiagramRpcClient().getSyntaxTree({ documentUri: props.documentUri });
			const stNode = (st as any).syntaxTree;
			setSTNode(stNode);
			setLoading(false);
		})();
	}, [props.documentUri]);

	const closePanel = () => {
		setSidePanelNodeRange(undefined);
		setSidePanelMediator(undefined);
		setSidePanelOpen(false);
		setSidePanelFormValues(undefined);
		setIsEditing(false);
	};

	let canvas;
	if (isLoading) {
		canvas = <h1>Loading... {lastUpdated}</h1>;
	} else {
		canvas = stNode &&
			<div>
				<SidePanelProvider value={{
					setIsOpen: setSidePanelOpen,
					isOpen: isSidePanelOpen,
					setIsEditing: setIsEditing,
					isEditing: isEditing,
					setNodeRange: setSidePanelNodeRange,
					nodeRange: sidePanelnodeRange,
					setShowBackBtn: setSidePanelShowBackBtn,
					showBackBtn: sidePanelShowBackBtn,
					setOperationName: setSidePanelMediator,
					operationName: sidePanelMediator,
					setFormValues: setSidePanelFormValues,
					formValues: sidePanelFormValues,
					setBackBtn: setSidePanelBackBtn,
					backBtn: sidePanelBackBtn
				}}>
					{isSidePanelOpen && <SidePanel
						isOpen={isSidePanelOpen}
						alignmanet="right"
						width={450}
					>
						<SidePanelTitleContainer>
							<div style={{ minWidth: "20px" }}>
								{
									sidePanelShowBackBtn && <Button onClick={incrementCount} appearance="icon">{"<"}</Button>
								}
							</div>
							{isEditing ? <div>Edit {sidePanelMediator}</div> : <div>Add New</div>}
							<Button onClick={closePanel} appearance="icon">X</Button>
						</SidePanelTitleContainer>
						<SidePanelList nodePosition={sidePanelnodeRange} documentUri={props.documentUri} />
					</SidePanel>}
					<ResourceCompartment name='Resource' stNode={stNode} documentUri={props.documentUri} />
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

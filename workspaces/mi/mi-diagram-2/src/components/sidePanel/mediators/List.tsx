/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, IconLabel } from '@wso2-enterprise/ui-toolkit';
import React, { ReactNode } from 'react';
import { LogIcon } from '../../../resources';
import { MEDIATORS } from '../../../resources/constants';
import CallForm from '../Pages/mediators/core/call';
import CallTemplateForm from '../Pages/mediators/core/call-template';
import CalloutForm from '../Pages/mediators/core/callout';
import DropForm from '../Pages/mediators/core/drop';
import HeaderForm from '../Pages/mediators/core/header';
import LogForm from '../Pages/mediators/core/log';
import LoopbackForm from '../Pages/mediators/core/loopback';
import PropertyForm from '../Pages/mediators/core/property';
import PropertyGroupForm from '../Pages/mediators/core/propertyGroup';
import RespondForm from '../Pages/mediators/core/respond';
import SendForm from '../Pages/mediators/core/send';
import SequenceForm from '../Pages/mediators/core/sequence';
import StoreForm from '../Pages/mediators/core/store';
import ValidateForm from '../Pages/mediators/core/validate';
import FilterForm from '../Pages/mediators/filter/filter';
import DataMapperForm from '../Pages/mediators/transformation/datamapper';
import EnrichForm from '../Pages/mediators/transformation/enrich';
import FastXSLTForm from '../Pages/mediators/transformation/fastXSLT';
import FaultForm from '../Pages/mediators/transformation/fault';
import JSONTransformForm from '../Pages/mediators/transformation/jsonTransform';
import PayloadForm from '../Pages/mediators/transformation/payload';
import RewriteForm from '../Pages/mediators/transformation/rewrite';
import SmooksForm from '../Pages/mediators/transformation/smooks';
import XQueryForm from '../Pages/mediators/transformation/xquery';
import XSLTForm from '../Pages/mediators/transformation/xslt';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
`;


interface MediatorProps {
    nodePosition: any;
    documentUri: string;
    setContent: React.Dispatch<React.SetStateAction<ReactNode>>;
    searchValue?: string;
}
export function Mediators(props: MediatorProps) {
    const sidePanelContext = React.useContext(SidePanelContext);

    const allMediators = {
        "core": [
            {
                title: "Call",
                operationName: MEDIATORS.CALL,
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Call Template",
                operationName: MEDIATORS.CALLTEMPLATE,
                form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
            },
            {
                title: "Callout",
                operationName: MEDIATORS.CALLOUT,
                form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
            },
            {
                title: "Drop",
                operationName: MEDIATORS.DROP,
                form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
            },
            {
                title: "Header",
                operationName: MEDIATORS.HEADER,
                form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
            },
            {
                title: "Log",
                operationName: MEDIATORS.LOG,
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Loopback",
                operationName: MEDIATORS.LOOPBACK,
                form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Property Group",
                operationName: MEDIATORS.PROPERTYGROUP,
                form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Send",
                operationName: MEDIATORS.SEND,
                form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
            },
            {
                title: "Sequence",
                operationName: MEDIATORS.SEQUENCE,
                form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
            },
            {
                title: "Store",
                operationName: MEDIATORS.STORE,
                form: <StoreForm nodePosition={props.nodePosition} documentUri={props.documentUri}></StoreForm>,
            },
            {
                title: "Validate",
                operationName: MEDIATORS.VALIDATE,
                form: <ValidateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ValidateForm>,
            }
        ],
        "transformation": [
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            },
            {
                title: "Enrich",
                operationName: MEDIATORS.ENRICH,
                form: <EnrichForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnrichForm>,
            },
            {
                title: "Fast XSLT",
                operationName: MEDIATORS.FASTXSLT,
                form: <FastXSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FastXSLTForm>,
            },
            {
                title: "Fault",
                operationName: MEDIATORS.FAULT,
                form: <FaultForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FaultForm>,
            },
            {
                title: "Json Transform",
                operationName: MEDIATORS.JSONTRANSFORM,
                form: <JSONTransformForm nodePosition={props.nodePosition} documentUri={props.documentUri}></JSONTransformForm>,
            },
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Rewrite",
                operationName: MEDIATORS.REWRITE,
                form: <RewriteForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RewriteForm>,
            },
            {
                title: "Smooks",
                operationName: MEDIATORS.SMOOKS,
                form: <SmooksForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SmooksForm>,
            },
            {
                title: "xquery",
                operationName: MEDIATORS.XQUERY,
                form: <XQueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XQueryForm>,
            },
            {
                title: "XSLT",
                operationName: MEDIATORS.XSLT,
                form: <XSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XSLTForm>,
            }
        ],
        "filter": [
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            }
        ]
    };

    const setContent = (content: any) => {
        props.setContent(content.form);
    }

    const searchForm = (value: string, search?: boolean) => {
        return Object.keys(allMediators).reduce((acc: any, key: string) => {
            const filtered = (allMediators as any)[key].filter((mediator: { title: string; }) =>
                search ? mediator.title.toLowerCase().includes(value?.toLowerCase()) : mediator.title.toLowerCase() === value?.toLowerCase());
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }
            , {});
    }

    const MediatorList = () => {
        let mediators;
        if (sidePanelContext.isEditing && sidePanelContext.operationName) {
            const form = searchForm(sidePanelContext.operationName, false);

            if (form) {
                setContent(Object.keys(form).length > 0 ? form[Object.keys(form)[0]][0] : {});
                return <></>;
            }
        }
        if (props.searchValue) {
            mediators = searchForm(props.searchValue, true);
        } else {
            mediators = allMediators;
        }

        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key}>
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                        <ButtonGrid>
                            {(values as any[]).map((action: { operationName: React.Key; title: string; }) => (
                                // <ButtonContainer key={action.title}>
                                <Button key={action.operationName} appearance='secondary' sx={{
                                    width: "auto",
                                    height: "40px",

                                    '& > vscode-button': {
                                        width: '100%',
                                        '::part(content)': {
                                            width: '-webkit-fill-available',
                                        }
                                    },
                                }} onClick={() => setContent(action)}>
                                    <div style={{
                                        width: "-webkit-fill-available",
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                        <LogIcon />
                                        <div >
                                            <IconLabel>{action.title.charAt(0).toUpperCase() + action.title.slice(1)}</IconLabel>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </ButtonGrid>
                        <hr style={{
                            borderColor: "var(--vscode-panel-border)",
                        }} />
                    </div>
                ))}
            </>
    }

    return (
        <div>
            <MediatorList />
        </div>
    );
}
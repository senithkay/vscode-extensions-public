import { Codicon, Drawer, ProgressRing, Typography } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useState, useContext, ReactNode } from 'react';
import styled from '@emotion/styled';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import SidePanelContext, { SidePanelPage } from './SidePanelContexProvider';
import { HomePage } from './mediators';
import { getAllDataServiceForms, getAllMediators } from './mediators/Values';
import AddConnector from './Pages/AddConnector';
import { FirstCharToUpperCase } from '../../utils/commons';
import ExpressionEditor from './expressionEditor/ExpressionEditor';
import { ExpressionFieldValue } from '../..';
import { DATA_SERVICE_NODES } from '../../resources/constants';
import InputPayloadForm from './Pages/InputPayload';

const SidePanelContainer = styled.div`
    padding: 20px;

    *{font-family: var(--font-family)}
`;

const LoaderContainer = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100vh;
    width: 100%;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    height: 30px;
`;

const ContentContainer = styled.div`
    height: calc(100vh - 50px);
    overflow-y: auto;
`;

const IconContainer = styled.div`
    width: 40px;

    & img {
        width: 25px;
    }
`;

export interface SidePanelListProps {
    nodePosition: Range;
    trailingSpace: string;
    documentUri: string;
}

export const sidepanelAddPage = (sidePanelContext: SidePanelContext, content: any, title?: string, icon?: string | ReactNode) => {
    sidePanelContext.setSidePanelState({
        ...sidePanelContext,
        pageStack: [...sidePanelContext.pageStack, { content, title, isOpen: true, icon }],
    });
}

export const sidepanelGoBack = (sidePanelContext: SidePanelContext, count: number = 1) => {
    if (sidePanelContext.pageStack.length > 0 && sidePanelContext.pageStack.length > count) {
        const pageStack = sidePanelContext.pageStack;
        pageStack[pageStack.length - count] = {
            ...pageStack[pageStack.length - count],
            isOpen: false,
            title: undefined,
            icon: undefined,
        };

        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            pageStack,
        });

        // remove the last page from the stack after it is closed
        setTimeout(() => {
            const pageStack = sidePanelContext.pageStack;
            pageStack.pop();
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                pageStack,
            });
        }, 200);
    }
};

export const handleOpenExprEditor = (value: ExpressionFieldValue, setValue: any, handleOnCancelExprEditorRef: any, sidePanelContext: SidePanelContext) => {
    const content = <ExpressionEditor
        value={value}
        handleOnSave={(value) => {
            setValue(value);
            handleOnCancelExprEditorRef.current();
        }}
        handleOnCancel={() => {
            handleOnCancelExprEditorRef.current();
        }}
    />;
    sidepanelAddPage(sidePanelContext, content, "Expression Editor");
}

const SidePanelList = (props: SidePanelListProps) => {
    const [isLoading, setLoading] = useState<boolean>(true);
    const sidePanelContext = useContext(SidePanelContext);

    useEffect(() => {
        setLoading(sidePanelContext.pageStack == undefined);
    }, [sidePanelContext.pageStack]);

    useEffect(() => {
        let mediatorsPage;

        if (sidePanelContext.isEditing && sidePanelContext.operationName) {
            if (sidePanelContext.operationName === "connector") {
                const form = <AddConnector
                    formData={sidePanelContext.formValues.form}
                    nodePosition={sidePanelContext.nodeRange}
                    documentUri={props.documentUri}
                    connectorName={sidePanelContext.formValues.connectorName}
                    operationName={sidePanelContext.formValues.operationName} />;
                mediatorsPage = { content: form, title: `Edit ${FirstCharToUpperCase(sidePanelContext.formValues.title)}` };
            } else if (Object.values(DATA_SERVICE_NODES).includes(sidePanelContext.operationName)) {
                const allForms = getAllDataServiceForms({
                    nodePosition: props.nodePosition,
                    trailingSpace: props.trailingSpace,
                    documentUri: props.documentUri,
                });

                const form = allForms.find(form => form.operationName.toLowerCase() === sidePanelContext.operationName?.toLowerCase());
                if (form) {
                    mediatorsPage = { content: form.form, title: `Edit ${form.title}` };
                }
            } else if(sidePanelContext.isEditing && sidePanelContext.operationName=="input"){

                mediatorsPage = { content: <InputPayloadForm />, title: `Edit Input Payload` };
            } else {

                const allMediators = getAllMediators({
                    nodePosition: props.nodePosition,
                    trailingSpace: props.trailingSpace,
                    documentUri: props.documentUri,
                    previousNode: sidePanelContext.previousNode,
                    parentNode: sidePanelContext.operationName?.toLowerCase() != sidePanelContext.parentNode?.toLowerCase() ? sidePanelContext.parentNode : undefined,
                });

                const form = Object.keys(allMediators).reduce((acc: any, key: string) => {
                    const filtered = (allMediators as any)[key].filter((mediator: { title: string; operationName: string }) =>
                        mediator.operationName.toLowerCase() === sidePanelContext.operationName?.toLowerCase());
                    if (filtered.length > 0) {
                        acc[key] = filtered;
                    }
                    return acc;
                }, {});

                if (form && Object.keys(form).length > 0) {
                    const val = form[Object.keys(form)[0]][0];
                    mediatorsPage = { content: val.form, title: `Edit ${val.title}` };
                }
            }
        } else {
            mediatorsPage = { content: <HomePage nodePosition={props.nodePosition} trailingSpace={props.trailingSpace} documentUri={props.documentUri} /> };
        }

        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            pageStack: [mediatorsPage]
        });
    }, []);

    const handleClose = () => {
        sidePanelContext.setSidePanelState({
            isOpen: false,
            isEditing: false,
            formValues: {},
            connectors: sidePanelContext.connectors,
            pageStack: [],
        });
    };

    const Icon = () => {
        if (sidePanelContext.pageStack.length > 0) {
          const lastPage = sidePanelContext.pageStack[sidePanelContext.pageStack.length - 1];
          if (lastPage.icon !== undefined) {
            if (typeof lastPage.icon === "string") {
              return (
                <IconContainer>
                  <img src={lastPage.icon} alt="Icon" />
                </IconContainer>
              );
            } else if (React.isValidElement(lastPage.icon)) {
              return <div style={{width: 40}}>{lastPage.icon}</div>;
            }
          }
        }
        return null;
      };

    const Title = () => {
        if (sidePanelContext.pageStack.length > 0) {
            const lastPage = sidePanelContext.pageStack[sidePanelContext.pageStack.length - 1];
            return lastPage.title !== undefined && <Typography variant='h3' sx={{ textAlign: "center", width: "fit-content" }}>{lastPage.title}</Typography>;
        }
    }

    return (
        <SidePanelContainer data-testid="sidepanel">
            {isLoading ? <LoaderContainer data-testid="sidepanel-loader">
                < ProgressRing />

            </LoaderContainer > :
                <>
                    {/* Header */}
                    <ButtonContainer>
                        {sidePanelContext.pageStack.length > 1 && sidePanelContext.pageStack[sidePanelContext.pageStack.length - 1].isOpen &&
                            <Codicon name="arrow-left" sx={{ width: "20px", position: "absolute", left: "0px", paddingLeft: "20px" }} onClick={() => sidepanelGoBack(sidePanelContext)} />}

                        <Icon />
                        <Title />
                        <Codicon name="close" sx={{ textAlign: "right", width: "20px", position: "absolute", right: "0px", paddingRight: "16px" }} onClick={handleClose} />
                    </ButtonContainer>

                    {/* Content */}
                    <div style={{ marginBottom: "30px" }}>
                        {
                            sidePanelContext.pageStack.map((page: SidePanelPage, index) => {
                                if (index === 0) {
                                    return (
                                        <ContentContainer key={index}>
                                            {page.content}
                                        </ContentContainer>
                                    )
                                }
                                return <Drawer
                                    isOpen={page.isOpen}
                                    id={`drawer${index}`}
                                    width={300}
                                    isSelected={page.isOpen}
                                    sx={{ width: "100%", top: "45px", border: "none", boxShadow: "none", height: "calc(100vh - 50px)", overflowY: "auto" }}
                                >
                                    {page.content}
                                </Drawer>
                            })
                        }
                    </div>
                </>}
        </SidePanelContainer>
    );
};

export default SidePanelList;

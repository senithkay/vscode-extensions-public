import { Codicon, Drawer, ProgressRing, Switch } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useState, useContext } from 'react';
import styled from '@emotion/styled';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import SidePanelContext from './SidePanelContexProvider';
import { MediatorPage } from './mediators';
import { AIPage } from './ai';
import ExpressionEditor from './expressionEditor/ExpressionEditor';
import { ExpressionFieldValue } from '../Form/ExpressionField/ExpressionInput';

const SidePanelContainer = styled.div`
    padding: 15px;

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
`;

const BtnStyle = {
    '& > vscode-button': {
        width: '130px',
        height: '40px',
        borderRadius: '5px',
    },
};

const IconContainer = styled.div`
    width: 40px;

    & img {
        width: 25px;
    }
`;

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const SidePanelList = (props: SidePanelListProps) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    const [isAddMediator, setAddMediator] = useState<boolean>(true);
    const [isGenerate, setGenerate] = useState<boolean>(false);
    const sidePanelContext = useContext(SidePanelContext);
    const [pageStack, setPageStack] = useState<any[]>([]);
    const [title, setTitle] = useState<string>("");
    const [iconpath, setIconPath] = useState<string>(undefined);

    useEffect(() => {
        setPageStack([]);
        setIconPath(sidePanelContext.iconPath);
    }, [sidePanelContext.operationName]);

    // show/hide back button based on pageStack length
    useEffect(() => {
        if (pageStack.length === 0) {
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                showBackBtn: false,
            })
        } else {
            sidePanelContext.setSidePanelState({
                ...sidePanelContext,
                showBackBtn: true,
            })
        }
    }, [pageStack]);

    const handleGoBack = () => {
        if (pageStack.length > 0) {
            setPageStack(pageStack.slice(0, -1));
        }
    };

    const handleClose = () => {
        sidePanelContext.setSidePanelState({
            isOpen: false,
            isEditing: false,
            formValues: {},
            connectors: sidePanelContext.connectors,
        });
    };

    const onSubmitExpressionEdtior = (data: ExpressionFieldValue) => {
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            expressionEditor: {
                isOpen: false,
                value: {
                    expressionValue: data.value,
                    namespaces: data.namespaces,
                }
            }
        });

        sidePanelContext.expressionEditor.setValue({
            isExpression: true,
            value: data.value,
            namespaces: data.namespaces,
        });
    };

    const handleOnCancelExpressionEdtior = () => {
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            expressionEditor: {
                ...sidePanelContext.expressionEditor,
                isOpen: false,
            }
        });
    }

    const setContent = async (content: any, title: string, iconPath?: string) => {
        setPageStack([...pageStack, content]);
        setTitle(title);
        setIconPath(iconPath);
    };

    return (
        <SidePanelContainer>
            {isLoading ? <LoaderContainer>
                < ProgressRing />

            </LoaderContainer > :
                <>
                    {/* Header */}
                    <ButtonContainer>
                        {(pageStack.length === 0 || sidePanelContext.isEditing) ? <div></div> :
                            <Codicon name="arrow-left" sx={{ width: "20px", position: "absolute", left: "0px", paddingLeft: "25px" }} onClick={handleGoBack} />}

                        {(pageStack.length > 0) && iconpath !== undefined && (
                            <IconContainer>
                                <img
                                    src={iconpath}
                                    alt="Icon"
                                />
                            </IconContainer>
                        )}
                        {pageStack.length > 0 && title !== undefined && <h3 style={{ textAlign: "center", width: "fit-content" }}>{title}</h3>}
                        <Codicon name="close" sx={{ textAlign: "right", width: "20px", position: "absolute", right: "0px", paddingRight: "16px" }} onClick={handleClose} />
                    </ButtonContainer>

                    {/* Content */}
                    <div style={{
                        overflowY: "auto",
                        height: "calc(100vh - 40px)",
                        scrollbarWidth: "none"
                    }}>
                        {pageStack.length === 0 && <>
                            {isAddMediator && <MediatorPage nodePosition={props.nodePosition} documentUri={props.documentUri} setContent={setContent} />}
                            {isGenerate && <AIPage />}
                        </>}
                        <div style={{ marginBottom: "30px" }}>
                            <Drawer
                                isOpen={pageStack.length > 0}
                                id="drawer1"
                                width={300}
                                isSelected={true}
                                sx={{ width: "100%", top: "0", position: "relative", border: "none", boxShadow: "none", transition: "none" }}
                            >
                                {pageStack.length > 0 && pageStack[pageStack.length - 1]}
                            </Drawer>
                            <Drawer
                                isOpen={sidePanelContext.expressionEditor?.isOpen}
                                id="drawer2"
                                width={300}
                                isSelected={true}
                                sx={{ width: "100%", top: "60px", border: "none", boxShadow: "none" }}
                            >
                                {sidePanelContext.expressionEditor?.isOpen &&
                                    <ExpressionEditor
                                        value={sidePanelContext.expressionEditor.value}
                                        handleOnSave={onSubmitExpressionEdtior}
                                        handleOnCancel={handleOnCancelExpressionEdtior}
                                    />}
                            </Drawer>
                        </div>
                    </div>
                </>}
        </SidePanelContainer>
    );
};

export default SidePanelList;

/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { Views } from '../../../resources';

interface DiagnosticsBannerProps {
    viewType: Views;
}

export function DiagnosticsBanner(props: DiagnosticsBannerProps) {
    const { viewType } = props;
    const [visibility, setVisibility] = useState<boolean>(true);
    const [expandComponents, updateComponentsStatus] = useState<boolean>(false);

    const { componentDiagnostics, editingEnabled, editLayerAPI } = useContext(DiagramContext);

    const getAction = () => {
        if (editingEnabled) {
            return <>
                {viewType !== Views.CELL_VIEW &&
                    <IconButton
                        color='inherit'
                        size='small'
                        onClick={handleAction}
                    >
                        {expandComponents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                }
                <Button
                    color='inherit'
                    size='small'
                    onClick={() => { editLayerAPI.executeCommand('workbench.action.problems.focus'); }}
                >
                    <strong>SEE PROBLEMS</strong>
                </Button>
            </>;
        } else {
            return <Button
                color='inherit'
                size='small'
                onClick={handleAction}
            >
                <strong>CLOSE</strong>
            </Button>;
        }
    }

    const handleAction = () => {
        if (editingEnabled) {
            // editLayerAPI.executeCommand('workbench.action.problems.focus');
            updateComponentsStatus(true);
        } else {
            setVisibility(false);
        }
    }

    const handleCloseComponentsView = (_event: React.SyntheticEvent | Event, _reason?: string) => {
        updateComponentsStatus(false);
    }

    return (
        <>
            <Snackbar
                open={visibility}
                message={'Project contains errors.'}
                anchorOrigin={{ vertical: 'top', horizontal: viewType === Views.CELL_VIEW ? 'center' : 'right' }}
                action={getAction()}
                ContentProps={{
                    sx: {
                        backgroundColor: '#f7d2d1',
                        color: 'black',
                        lineHeight: '22px',
                        textAlign: 'justify'
                    }
                }}
                sx={{ fontFamily: 'GilmerRegular', top: viewType === Views.CELL_VIEW ? '110px !important' : '50px !important' }}
            />
            {expandComponents &&
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {componentDiagnostics.map((component, index) => {
                        return <Snackbar
                            open={visibility}
                            onClose={handleCloseComponentsView}
                            message={component}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            ContentProps={{
                                sx: {
                                    backgroundColor: '#fbefee',
                                    color: 'black',
                                    lineHeight: '22px',
                                    textAlign: 'justify',
                                    display: 'flex',
                                    flexDirection: 'row'
                                }
                            }}
                            sx={{
                                fontFamily: 'GilmerRegular',
                                top: viewType === Views.CELL_VIEW ? `${110 + (60 * (index + 1))}px !important` :
                                    `${50 + (60 * (index + 1))}px !important`
                            }}
                        />
                    })}
                </div>
            }
        </>
    );
}

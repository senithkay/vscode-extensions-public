import React from 'react';
import styled from '@emotion/styled';
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const ConfirmDialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ConfirmDialogContainer = styled.div`
  background: var(--vscode-foreground);
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  color: var(--vscode-input-background);
`;

const ConfirmDialogHeader = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
`;

const ConfirmDialogButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
    const { isOpen, onClose, onConfirm} = props;
    if (!isOpen) return null;

    return (
        <ConfirmDialogOverlay>
            <ConfirmDialogContainer>
                <ConfirmDialogHeader>Confirm Deletion</ConfirmDialogHeader>
                <p>Are you sure you want to proceed?</p>
                <ConfirmDialogButtons>
                    <VSCodeButton appearance="secondary" title="Confirm" onClick={onConfirm}>
                        Confirm
                    </VSCodeButton>
                    <VSCodeButton appearance="primary" title="Cancel" onClick={onClose}>
                        Cancel
                    </VSCodeButton>
                </ConfirmDialogButtons>
            </ConfirmDialogContainer>
        </ConfirmDialogOverlay>
    );
};

export default ConfirmDialog;

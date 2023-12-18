import styled from "@emotion/styled";

export const TreeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 24px 24px;
    gap: 8px;
    background: var(--vscode-input-background);
    box-shadow: 0px 5px 50px rgba(203, 206, 219, 0.5);
    border-radius: 12px;
    color: var(--vscode-input-foreground);
    font-family: GilmerMedium;
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 24px;
`;

export const TreeContainerWithTopMargin = styled(TreeContainer)`
    margin-top: 40px;
`;

export const TreeHeader = styled.div((
    { isSelected, isDisabled }: { isSelected?: boolean, isDisabled?: boolean }
) => ({
    height: '40px',
    padding: '8px',
    background: `${isDisabled ? 'var(--vscode-editorWidget-background)' : isSelected ? 'var(--vscode-inputValidation-infoBackground)' : 'var(--vscode-editorWidget-background)'}`,
    borderRadius: '3px',
    width: '100%',
    display: 'flex',
    cursor: `${isDisabled ? 'not-allowed' : 'pointer'}`,
    '&:hover': {
        backgroundColor: `${isDisabled ? 'var(--vscode-editorWidget-background)' : 'var(--vscode-tab-inactiveBackground)'}`
    }
}));

export const TreeBody = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1px;
    gap: 1px;
    background: var(--vscode-editorHoverWidget-statusBarBackground);
    border-radius: 3px;
    flex: none;
    flex-grow: 0;
    width: 100%;
    cursor: pointer;
`;

import styled from '@emotion/styled';
import React from 'react';
const Container = styled.div`
	* {
		box-sizing: border-box;
	}
	position: absolute;
	left: 0;
	top: 0;
	z-index: 5;
	height: 2px;
	width: 100%;
	overflow: hidden;

	.progress-bar {
		background-color: var(--vscode-progressBar-background);
		display: none;
		position: absolute;
		left: 0;
		width: 2%;
		height: 2px;
	}

	&.active .progress-bar {
		display: inherit;
	}

	&.discrete .progress-bar {
		left: 0;
		transition: width 0.1s linear;
	}

	&.discrete.done .progress-bar {
		width: 100%;
	}

	&.infinite .progress-bar {
		animation-name: progress;
		animation-duration: 4s;
		animation-iteration-count: infinite;
		animation-timing-function: steps(100);
		transform: translateZ(0);
	}

	@keyframes progress {
		0% {
			transform: translateX(0) scaleX(1);
		}

		50% {
			transform: translateX(2500%) scaleX(3);
		}

		to {
			transform: translateX(4900%) scaleX(1);
		}
	}

`;

export const ProgressIndicator = () => {
	return (
		<Container className="infinite active" role="progressbar">
			<div className="progress-bar"></div>
		</Container>
	);
};

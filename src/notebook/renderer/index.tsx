import { h, render } from 'preact';
import { ActivationFunction, OutputItem, RendererContext } from 'vscode-notebook-renderer';
import { Table } from './table';

export const activate: ActivationFunction = (context: RendererContext<any>) => ({
	renderOutputItem(data: OutputItem, element) {
		try {
			render(<Table shellOutput={data.json()}/>, element);
		} catch {
			render(<p>Error!</p>, element);
		}
	}
});

import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AuthenticationForm } from './AuthenticationForm';

export class AuthenticationComponent
	implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	
	private _value: number;	
	private _notifyOutputChanged: () => void;	
	private labelElement: HTMLLabelElement;	
	private inputElement: HTMLInputElement;	
	private _container: HTMLDivElement;	
	private _context: ComponentFramework.Context<IInputs>;	
	private _refreshData: EventListenerOrEventListenerObject;

	constructor() { }

	public init(
		context: ComponentFramework.Context<IInputs>,
		notifyOutputChanged: () => void,
		state: ComponentFramework.Dictionary,
		container: HTMLDivElement
	) {
		this._context = context;		
		this._container = document.createElement("div");
		
		this.buildSampleComponent(context, notifyOutputChanged);

		container.appendChild(this._container);
	}

	public buildSampleComponent(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void): void {
		this._notifyOutputChanged = notifyOutputChanged;
		this._refreshData = this.refreshData.bind(this);

		this.inputElement = document.createElement("input");
		this.inputElement.setAttribute("type", "range");
		this.inputElement.addEventListener("input", this._refreshData);
		this.inputElement.setAttribute("min", "1");
		this.inputElement.setAttribute("max", "1000");
		this.inputElement.setAttribute("class", "linearslider");
		this.inputElement.setAttribute("id", "linearrangeinput");

		this.labelElement = document.createElement("label");
		this.labelElement.setAttribute("class", "TS_LinearRangeLabel");
		this.labelElement.setAttribute("id", "lrclabel");

		this._value = context.parameters.sliderValue.raw
			? context.parameters.sliderValue.raw
			: 0;
		this.inputElement.value =
			context.parameters.sliderValue.formatted
				? context.parameters.sliderValue.formatted
				: "0";

		this.labelElement.innerHTML = context.parameters.sliderValue.formatted
			? context.parameters.sliderValue.formatted
			: "0";

		this._container.appendChild(this.inputElement);
		this._container.appendChild(this.labelElement);
	}  

	public refreshData(evt: Event): void {
		this._value = (this.inputElement.value as any) as number;
		this.labelElement.innerHTML = this.inputElement.value;
		this._notifyOutputChanged();
	}

	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this._value = context.parameters.sliderValue.raw
			? context.parameters.sliderValue.raw
			: 0;
		this._context = context;
		this.inputElement.value =

			context.parameters.sliderValue.formatted
				? context.parameters.sliderValue.formatted
				: "";

		this.labelElement.innerHTML = context.parameters.sliderValue.formatted
			? context.parameters.sliderValue.formatted
			: "";

		ReactDOM.render(
			React.createElement(
				AuthenticationForm
			),
			this._container
		);
	}

	public getOutputs(): IOutputs {
		return {
			sliderValue: this._value
		};
	}

	public destroy() {
		this.inputElement.removeEventListener("input", this._refreshData);
	}
}

import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { TextSummarizer, ITextSummarizerProps } from './summarizer';

export class SummerizeInputControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    // Reference to the notifyOutputChanged method
	private notifyOutputChanged: () => void;
    // Reference to the container div
	private theContainer: HTMLDivElement;
	// Reference to the React props, prepopulated with a bound event handler
	private props: ITextSummarizerProps = {

	}
    // Local variable to captures changes
	private _textInput: string;
	private _subscriptionKey: string;
	private _endpoint: string;

	private _isSummarize: boolean;
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this.notifyOutputChanged = notifyOutputChanged;

		this._textInput = context.parameters.TextInput.raw || "";
		this._subscriptionKey = context.parameters.SubscriptionKey.raw || "";
		this._endpoint = context.parameters.Endpoint.raw || "";

		this._isSummarize = context.parameters.Summarize.raw;		
		this.theContainer = container;

		this.getSummarizedText(this, this._subscriptionKey, this._endpoint, this._textInput, this._isSummarize);
    }
    
    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        if (this._textInput !== context.parameters.TextInput.raw
			|| this._subscriptionKey !== context.parameters.SubscriptionKey.raw
			|| this._endpoint !== context.parameters.Endpoint.raw
			|| this._isSummarize !== context.parameters.Summarize.raw
			) {

			this._textInput = context.parameters.TextInput.raw || "";
			this._subscriptionKey = context.parameters.SubscriptionKey.raw || "";
			this._endpoint = context.parameters.Endpoint.raw || "";

			this._isSummarize = context.parameters.Summarize.raw;
			this.getSummarizedText(this, this._subscriptionKey, this._endpoint, this._textInput, this._isSummarize);
			this.renderReactDOM(this);
		}
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
			TextInput: this._textInput
		};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        ReactDOM.unmountComponentAtNode(this.theContainer);
    }
    /********** Private Functions **********/
/**
	 * Calls Text Summarizer API to get the Summarized Text
	 * @param subKey Subscription Key for Text Analytics API
	 * @param endPoint Endpoint for Text Analytics API
	 */
private getSummarizedText(parent: any, subKey: string, endPoint: string, textToSummarize:string, isSummarize: boolean): void {
    let responseText: any;
    let https = require('https');
    let summarizePath = '/language/analyze-text/jobs?api-version=2022-10-01-preview';
    let inputDocuments = {
        'documents': [
            { 'id': '1', 'text': textToSummarize }
        ]
    };
    let body = JSON.stringify(inputDocuments);

    /**
		 * Validations
		 */
		// Condition for Testing Only -  || k === "val" || ep === "val" 
		if (subKey === "" || endPoint === "" || subKey === undefined || endPoint === undefined) {
			parent.props.isSummarize = false;			
			parent.props.showError = true;
			parent.renderReactDOM(parent);
			return;
		}
		else {
			parent.props.isSummarize = true;			
			parent.props.showError = false;
		}
    

   
if(isSummarize)
{
    let summarizeRequestParams = {
        method: 'POST',
        hostname: (new URL(endPoint)).hostname,
        path: summarizePath,
        headers: {
            'Ocp-Apim-Subscription-Key': subKey,
            'Content-Type': 'application/json',
        }
    };
    let summarizeResponse = function (response: any) {
        let body = '';
        response.on('data', function (d: any) {
            body += d;
        });
        response.on('end', function () {
            try {
                let responseBody = JSON.parse(body);
                responseText = responseBody.documents[0].sentences;               
            } catch (error) {
                //responseText = "N/A";
            }
            parent.props.Summarize = responseText;
            parent.props.isSummarize = true;
            parent.renderReactDOM(parent);
        });
        response.on('error', function (e: any) {
            console.log('Error: ' + e.message);
        });
    }
    let summarizeRequest = https.request(summarizeRequestParams, summarizeResponse);
    summarizeRequest.write(body);
	summarizeRequest.end();
}
else {
    parent.props.isSummarize = false;
    parent.renderReactDOM(parent);
}
}
private renderReactDOM(parent: any): void {
    ReactDOM.render(
        // Create the React component
        React.createElement(
            TextSummarizer,
            parent.props
        ),
        parent.theContainer
    );
}
}

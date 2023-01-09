import * as React from "react";

export interface ITextSummarizerProps {
    summerize?:string;
    rankScore?:number;
    isSummerize?: boolean;
    showError?: boolean;
}
export interface ITextSummarizerState extends React.ComponentState {
}
export class TextSummarizer extends React.Component<ITextSummarizerProps, ITextSummarizerState> {

    constructor(props: ITextSummarizerProps) {
        super(props);

        this.state = {
            summerize: props.summerize || "N/A",
            rankScore:props.rankScore||0,
            isSummerize: props.isSummerize || true,
                      showError: props.showError || false,
        };
}
public componentWillReceiveProps(newProps: ITextSummarizerProps): void {
    this.setState(newProps);
}
ExtractiveSummarizer = (responseData: any) => {
    let tdChildren: any = [];
    let tdParent: any;

    for (let i = 0; i < responseData.length; i++) {
       
            tdChildren.push(<span>&nbsp;&nbsp;{`(${responseData[i].text})`}</span>); 
            tdChildren.push(<span>&nbsp;&nbsp;{`(${responseData[i].rankScore})`}</span>);            
            tdChildren.push(<br></br>);
        
    }
    tdParent = <td>{tdChildren}</td>;
    return tdParent;
  }
public render(): JSX.Element {
    let summarizeRow: any, rankScoreRow: any;
    

    if (this.state.showError) {
        summarizeRow =  <tr>
                            <td colSpan={2}>
                                {"Error occured while summarizing the text. Check your Subscription Key and Endpoint."}
                            </td>
                        </tr>;
    }
    else {
        summarizeRow =  <tr>
                            <td>
                                {"summarized Text:"}
                            </td>
                            <td>
                                
                                {this.ExtractiveSummarizer(this.state.summerize)}
                            </td>
                        </tr>;
    }
    if (this.state.rankScore) {
        rankScoreRow =   <tr>
                            <td>
                                {"Rank Score:"}
                            </td>
                            <td>
                                {this.state.rankScore}
                            </td>
                        </tr>;
    }
    else {
        rankScoreRow = "";
    }
    return (
        <div className={"summarizerWrapper"}>
            <table className={"table table-striped table-sm"}>
                <tbody>
                    {summarizeRow}
                    {rankScoreRow}
                  </tbody>
            </table>


        </div>
    );
}

}
import React from 'react';
import EntryCardContainer from '../components/PropEntryCardContainer';
import ClaimTopField from '../averitec_components/ClaimTopField';
import QuestionEntryField from '../averitec_components/QuestionEntryField';
import PhaseControl from '../averitec_components/PhaseControl';
import VerdictBar from '../averitec_components/VerdictBar';
import ReportBar from '../averitec_components/ReportBar';
import PhaseFourTopField from '../averitec_components/PhaseFourTopField';

class PhaseFourQuestionGenerationBar extends React.Component {

  render() {    

    return (
      <div>
        {!this.props.posthocView ?
          <div>
            <PhaseControl 
            current_idx={this.props.current_idx} 
            final_idx={this.props.final_idx} 
            finalRedirect={this.props.finish_path}
            phaseName="Question Generation" 
            phaseInstructions="Please read the claim below, the fact checking article to the left, and the previously generated verdicts and question-answer pairs. Then, construct additional question-answer pairs to resolve the disagreement between the two verdicts. You can use any links in the fact checking article to provide sources for your answers. If the links in the fact-checking article are not sufficient, you can also use our custom search field below; please do not use any other search field. If you cannot find an answer to a question you ask, please label that question &quot;Unanswerable&quot; and ask another question. When you have collected enough evidence to verify the claim independently of the fact checking article, please give your verdict. Please spend no more than 15 minutes on each claim." />
          </div>
          : ""
        }
        <EntryCardContainer
          headerClass={PhaseFourTopField}
          contentClass={QuestionEntryField}
          footerClass={VerdictBar}
          entryName="qa_pair"
          addTooltip="Add another question. Only do so if you think the question-answer pairs you have already collected do not contain sufficient evidence to give a verdict for the claim."
          annotation={this.props.annotation}
          static_data={this.props.static_data}
          entries={this.props.annotation ? this.props.annotation.questions : undefined}
          addEntry={this.props.addEntry}
          deleteEntry={this.props.deleteEntry}
          doSubmit={this.props.doSubmit}
          posthocView={this.props.posthocView}
          dataset={this.props.dataset}
          valid={this.props.valid}
          handleFieldChange={this.props.handleFieldChange}
          current_idx={this.props.current_idx}
          latest_idx={this.props.latest_idx}
          doNext={this.props.doNext}
          doPrevious={this.props.doPrevious}
        />
      </div>
    );
  }
}

export default PhaseFourQuestionGenerationBar
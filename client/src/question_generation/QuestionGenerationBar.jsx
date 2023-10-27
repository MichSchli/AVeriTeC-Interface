import React from 'react';
import EntryCardContainer from '../components/PropEntryCardContainer';
import ClaimTopField from '../averitec_components/ClaimTopField';
import QuestionEntryField from '../averitec_components/QuestionEntryField';
import PhaseControl from '../averitec_components/PhaseControl';
import VerdictBar from '../averitec_components/VerdictBar';
import ReportBar from '../averitec_components/ReportBar';

class QuestionGenerationBar extends React.Component {

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
              phaseInstructions="Please read the claim below, and the fact checking article to the left. Then, construct question-answer pairs. You can use any links in the fact checking article to provide sources for your answers. If the links in the fact-checking article are not sufficient, you can also use our custom search field below; please do not use any other search field. If you cannot find an answer to a question you ask, please label that question &quot;Unanswerable&quot; and ask another question. When you have collected enough evidence to verify the claim independently of the fact checking article, please give your verdict. Please spend no more than 15 minutes on each claim." />
            <ReportBar handleSkip={this.props.handleSkip} phase={2} disabled={!this.props.skip_enabled} />
          </div>
          : ""
        }
        <EntryCardContainer
          headerClass={ClaimTopField}
          contentClass={QuestionEntryField}
          footerClass={VerdictBar}
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

export default QuestionGenerationBar
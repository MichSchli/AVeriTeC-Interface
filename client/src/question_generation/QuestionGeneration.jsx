import React from 'react';
import QuestionGenerationBar from './QuestionGenerationBar';
import ClaimPageView from '../components/ClaimPageView';
import styled from 'styled-components';
import SearchField from '../components/SearchField';
import { TourProvider } from "@reactour/tour";
import TourWrapper from '../components/TourWrapper';
import { WarningRounded } from '@material-ui/icons';
import axios from "axios";
import { Redirect } from "react-router-dom";
import config from "../config.json"
import moment from "moment";
import QuestionGenerationConfirmation from "./QuestionGenerationConfirmation"
import { notEmptyValidator, atLeastOneValidator, notBooleanValidator, emptyOrValidUrlValidator, noUrlOverlapValidator } from '../utils/validation.js'

const QADataField = styled.div`
    width: -webkit-calc(40% - 10px)!important;
    width:    -moz-calc(40% - 10px)!important;
    width:         calc(40% - 10px)!important;
    float:left;
    overflow:auto;
    border-style:inset;
    border-width:2px;
    height: -webkit-calc(100% - 6px)!important;
    height:    -moz-calc(100% - 6px)!important;
    height:         calc(100% - 6px)!important;
`

const QAPageView = styled(ClaimPageView)`
    width:60%;
    float:left;
    border-style:inset;
    border-width:2px;
    height: -webkit-calc(100% - 6px)!important;
    height:    -moz-calc(100% - 6px)!important;
    height:         calc(100% - 6px)!important;
`

const QAPageDiv = styled.div`
    width: 100%;
    height: 100vh;
`

const WarningDiv = styled.div`
    color:#D0342C;
    display:inline;
    position:absolute;
    margin: -5px 0px 0px -2px;
`

function validate(content) {
  var valid = true

  if (content["annotation_request"]["annotation"]["skipped"] == true) {
    return true
  }

  if (!("label" in content["annotation_request"]["annotation"]) || notEmptyValidator(content["annotation_request"]["annotation"]["label"]).error) {
    console.log("no label");
    valid = false;
  }

  if ("should_correct" in content["annotation_request"]["annotation"] && content["annotation_request"]["annotation"]["should_correct"] == true && (!("claim_correction" in content["annotation_request"]["annotation"]) || notEmptyValidator(content["annotation_request"]["annotation"]["claim_correction"]).error)) {
    console.log("no correction");
    valid = false;
  }

  Object.values(content["annotation_request"]["annotation"]["questions"]).forEach(entry => {
    if (!("question" in entry) || notEmptyValidator(entry["question"]).error) {
      console.log("no question");
      valid = false;
    }
    else if (!"answers" in entry) {
      console.log("no answers");
      valid = false;
    } else {
      entry["answers"].forEach(answer => {
        if (!("answer_type" in answer) || notEmptyValidator(answer["answer_type"]).error) {
          console.log("no answer type");
          valid = false;
        }

        if (!("source_url" in answer) || notEmptyValidator(answer["source_url"]).error || emptyOrValidUrlValidator(answer["source_url"]).error) {
          if (!("answer_type" in answer) || (answer["answer_type"] != "Unanswerable" && answer["source_medium"] != "Metadata")) {
            console.log("no source url and not unanswerable");
            valid = false;
          }
        }

        if ("source_url" in answer && noUrlOverlapValidator(content["annotation_request"]["article"]["fact_checking_article"])(answer["source_url"]).error) {
          console.log("url overlap");
          valid = false;
        }

        if (!("source_medium" in answer) || notEmptyValidator(answer["source_medium"]).error) {
          if (!("answer_type" in answer) || answer["answer_type"] != "Unanswerable") {
            console.log("no source medium and not unanswerable");
            valid = false;
          }
        }

        if (answer["answer_type"] == "Boolean") {
          if (!("boolean_explanation" in answer) || notEmptyValidator(answer["boolean_explanation"]).error) {
            console.log("boolean and no expl");
            valid = false;
          }
        } else if (notBooleanValidator(answer["answer"]).error) {
          console.log("wrong type for boolean");
          valid = false;
        }

        if (answer["answer_type"] != "Unanswerable") {
          if (!("answer" in answer) || notEmptyValidator(answer["answer"]).error) {
            console.log("no answer and not unanswerable");
            valid = false;
          }
        }
      });
    }
  });

  console.log(valid);

  return valid;
}

class QuestionGeneration extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      annotation_request: {
        annotation: this.get_default_annotation(),
        article: {
          "claim": "",
          "fact_checking_article": "",
          "fact_checking_date": new Date(),
        },
        p1_annotation: {
          "claim": "",
        },
        has_been_submitted: false,
      },
      request_timestamp: new Date(),
      userIsFirstVisiting: false,
      valid: true,
      current_idx: 0,
      final_idx: 0,
      confirmation: false,
      latest_idx: -1,
      skip_enabled: false
    }

    this.doSubmit = this.doSubmit.bind(this);
    this.skipHandler = this.skipHandler.bind(this);
    this.doPrevious = this.doPrevious.bind(this);
    this.doNext = this.doNext.bind(this);
    this.proceedToConfirmation = this.proceedToConfirmation.bind(this);
    this.cancelConfirmation = this.cancelConfirmation.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.addEntry = this.addEntry.bind(this);
    this.loadingDoneHandler = this.loadingDoneHandler.bind(this);
    this.updateData = this.updateData.bind(this);
    this.shouldPreventSubmissionBecauseOfUnanswerables = this.shouldPreventSubmissionBecauseOfUnanswerables.bind(this);
  }

  loadingDoneHandler(seconds_taken) {
    let previous_load_seconds = this.state.annotation_request.annotation ? this.state.annotation_request.annotation.load_seconds : 0;
    this.setState({
      annotation_request: {
        ...this.state.annotation_request,
        annotation: {
          ...this.state.annotation_request.annotation,
          load_seconds: seconds_taken + previous_load_seconds
        }
      },
      skip_enabled: !this.state.annotation_request.has_been_submitted
    })
    console.log("Loading done!")
  }

  shouldPreventSubmissionBecauseOfUnanswerables() {
    if (Object.values(this.state.annotation_request.annotation.questions).length >= 5) {
      return false;
    }

    let retval = true;
    Object.values(this.state.annotation_request.annotation.questions).forEach(entry => {
      if ("answers" in entry) {
        entry["answers"].forEach(answer => {
          if (answer["answer_type"] != "Unanswerable") {
            console.log("Found a good answer.")
            retval = false
            return;
          }
        });
      }
    });

    return retval;
  }

  skipHandler(reason) {
    this.setState({
      annotation_request: {
        ...this.state.annotation_request,
        annotation: {
          ...this.state.annotation_request.annotation,
          skipped: true,
          skipped_reason: reason,
          questions: []
        }
      }
    }, () => {
      this.doSubmit()
    });
  }

  updateData(is_initial) {
    var dataset = "annotation";
    if (this.props.dataset) {
      dataset = this.props.dataset;
    }

    console.log(dataset);

    if (localStorage.getItem('token')) {
      console.log("I'm getting new data for dataset " + dataset);
      var request = {
        method: "post",
        baseURL: config.api_url,
        url: "/annotations/p2/" + localStorage.getItem('user_id'),
        data: {
          dataset: dataset,
        },
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };

      axios(request).then((response) => {
        let all_annotation_requests = response.data.annotationRequests;

        // If a cutoff has been specified, discard requests after the cutoff:
        if (this.props.finish_at) {
          all_annotation_requests = all_annotation_requests.slice(0, this.props.finish_at);
        }

        // Set the final index to the number of annotation requests:
        this.setState({
          final_idx: all_annotation_requests.length
        });

        let current_idx = 0;
        if (is_initial) {
          // Set the current index to the first request that has not been submitted:
          for (let i = 0; i < all_annotation_requests.length; i++) {
            current_idx = i;
            if (!all_annotation_requests[i].has_been_submitted) {
              break;
            }
          }

          this.setState({
            current_idx: current_idx,
            latest_idx: current_idx - 1
          });
        } else {
          current_idx = this.state.current_idx;
        }

        // If the current annotation request has no annotation, add the default one:
        if (!all_annotation_requests[current_idx].annotation) {
          all_annotation_requests[current_idx].annotation = this.get_default_annotation();
        }

        // Memorize the current annotation request:
        this.setState({
          annotation_request: all_annotation_requests[current_idx],
          request_timestamp: new Date(),
          confirmation: false,
          valid: true
        });

        // If the user is visiting for the first time, set the flag:
        if (current_idx === 0 && is_initial) {
          this.setState({
            userIsFirstVisiting: true
          });
        }

      }).catch((error) => { window.alert(error); });
    }
  }

  get_default_question = () => {
    return {
      question: "",
      answers: [
        {
          "answer": "",
          "answer_type": "",
          "source_url": "",
          "source_medium": "",
          "bool_explanation": ""
        }
      ],
      load_seconds: 0,
      work_seconds: 0,
    }
  }

  get_default_annotation = () => {
    return {
      "questions": [
        this.get_default_question()
      ],
      "label": ""
    }
  }


  deleteEntry = (entryId) => {
    let entries = this.state.annotation_request.annotation.questions
    entries.splice(entryId, 1)

    this.setState({
      annotation_request: {
        ...this.state.annotation_request,
        annotation: {
          ...this.state.annotation_request.annotation,
          questions: entries
        }
      }
    });
  }

  addEntry = () => {
    let entries = this.state.annotation_request.annotation.questions
    entries.push(this.get_default_question())

    this.setState({
      annotation_request: {
        ...this.state.annotation_request,
        annotation: {
          ...this.state.annotation_request.annotation,
          questions: entries
        }
      }
    });
  }

  handleFieldChange(fieldId, element, value) {
    console.log("Field change " + fieldId + " " + element + " " + value)
    if (fieldId === "claim_header" || fieldId === "claim_footer") {
      this.setState(prevState => ({
        annotation_request: {
          ...prevState.annotation_request,
          annotation: {
            ...prevState.annotation_request.annotation,
            [element]: value
          }
        }
      }))
    } else {
      this.setState(prevState => ({
        annotation_request: {
          ...prevState.annotation_request,
          annotation: {
            ...prevState.annotation_request.annotation,
            questions: prevState.annotation_request.annotation.questions.map((entry, idx) => {
              if (idx == fieldId) {
                return {
                  ...entry,
                  [element]: value
                }
              } else {
                return entry
              }
            }
            )
          }
        }
      }))
    }
  }

  async doSubmit() {
    var dataset = "annotation"
    if (this.props.dataset) {
      dataset = this.props.dataset
    }

    var current_idx = this.state.current_idx
    let is_at_last_claim = current_idx + 1 === this.state.final_idx;

    let actual_finish_path = this.props.finish_path ? this.props.finish_path : "/control/";

    if (validate(this.state)) {
      let now_timestamp = new Date();
      let seconds_taken = (now_timestamp - this.state.request_timestamp) / 1000;
      let annotation_request = this.state.annotation_request;

      annotation_request.annotation.load_seconds = annotation_request.annotation.load_seconds ? annotation_request.annotation.load_seconds : seconds_taken;
      annotation_request.annotation.work_seconds = annotation_request.annotation.work_seconds ? annotation_request.annotation.work_seconds + seconds_taken : seconds_taken;
      annotation_request.submit_timestamp = now_timestamp;

      var request = {
        method: "post",
        baseURL: config.api_url,
        url: "/annotations/submit/",
        data: {
          annotation_request: annotation_request,
          dataset: dataset,
          phase: 2,
          user_id: localStorage.getItem('user_id'),
        },
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };

      console.log("Making submission")

      axios(request).then((response) => {
        console.log(response)
        if (is_at_last_claim) {
          window.location.href = actual_finish_path
        } else {
          // If the current idx is higher than latest idx, update it:
          if (current_idx > this.state.latest_idx) {
            this.setState({
              latest_idx: current_idx,
              userIsFirstVisiting: false
            });
          }

          // Go to the next claim, then update data:
          this.doNext();
        }
      }).catch((error) => { window.alert(error) })
    } else {
      this.setState({
        valid: false
      });
    }
  }

  componentDidMount() {
    //localStorage.setItem('phase', "phase_1");
    this.updateData(true);
  }

  doNext() {
    this.setState({
      current_idx: this.state.current_idx + 1,
      skip_enabled: false
    }, () => {
      this.updateData(false);
    }
    );
  }

  doPrevious() {
    this.setState({
      current_idx: this.state.current_idx - 1,
      skip_enabled: false
    }, () => {
      this.updateData(false);
    }
    );
  }


  changeLabel = event => {
    const { name, value } = event.target;

    this.setState({
      annotation_request: {
        ...this.state.annotation_request,
        annotation: {
          ...this.state.annotation_request.annotation,
          [name]: value
        }
      }
    });
  }

  proceedToConfirmation() {
    console.log("Valid: " + validate(this.state));

    if (validate(this.state)) {
      if (this.shouldPreventSubmissionBecauseOfUnanswerables()) {
        console.log(this.shouldPreventSubmissionBecauseOfUnanswerables())
        console.log("Blocked submission because all answers are unanswerable.")
        window.alert("Please try to find at least a partial answer to one of your questions. If you cannot, try to ask more questions, or rephrase and reask one of your questions.");
      } else {
        this.setState({
          confirmation: true
        });
      }
    } else {
      this.setState({
        valid: false
      });
    }
  }

  cancelConfirmation() {
    this.setState({
      confirmation: false
    });
  }

  render() {
    var dataset = "annotation"
    if (this.props.dataset) {
      dataset = this.props.dataset
    }

    console.log("Current state:")
    console.log(this.state)
    console.log(this.state.annotation_request.article.fact_checking_article)

    if (!localStorage.getItem('token')) {
      return <Redirect to='/' />;
    }

    var problemSourceText = <div>Searching the internet may return results from untrustworthy sources. We have compiled a list of the most common, and our search engine marks these with <WarningDiv><WarningRounded /></WarningDiv>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;. If possible, please avoid using these.</div>

    const steps = [
      {
        selector: '[data-tour="claim_text"]',
        content: "Begin by reading the claim."
      },
      {
        selector: '[data-tour="claim_page_view"]',
        content: "Carefully read the fact-checking article to see how this claim was verified."
      },
      {
        selector: '[data-tour="report"]',
        content: "If the fact-checking article shows a 404 page or another error, or if the article is behind a paywall, you can report it to us (although please give it a minute to load - some sites are not very fast)."
      },
      {
        selector: '[data-tour="question_textfield"]',
        content: "Based on the approach taken by the fact-checkers, formulate a question that will help you determine the truth of the claim. This should be a real question rather than a search engine query, e.g. \"Who is the prime minister of Britain?\" rather than \"prime minister Britain\"."
      },
      {
        selector: '[data-tour="answer_textfield"]',
        content: "Find an answer to your question. You can use any sources linked to in the fact-checking article..."
      },
      {
        selector: '[data-tour="search"]',
        content: "... or if those do not give you the answers you need, find new sources using our custom search field."
      },
      {
        selector: '[data-tour="search"]',
        content: problemSourceText
      },
      {
        selector: '[data-tour="search"]',
        content: "The search engine may also return results from other fact-checking sites. If possible, please avoid using these as well."
      },
      {
        selector: '[data-tour="search"]',
        content: "Similarly, if possible please avoid using results directly originating from the source or the speaker of the claim."
      },
      {
        selector: '[data-tour="claim_page_view"]',
        content: "WARNING: For persistence, we have stored all fact-checking articles on archive.org. Fact-checking articles may feature \"double-archived\" links using both archive.org and archive.is, e.g. \"https://web.archive.org/web/20201229212702/https://archive.md/28fMd\". Archive.org returns a 404 page for these. To view such a link, please just copy-paste the archive.is part (e.g. \"https://archive.md/28fMd\") into your browser."
      },
      {
        selector: '[data-tour="claim_page_view"]',
        content: "Links to archive.org allow you to select an archival date. Try to rely only on evidence that has appeared on the internet before the claim; e.g. with archive.org, if possible choose a date from before the claim was made."
      },
      {
        selector: '[data-tour="answer_metadata"]',
        content: "Please let us know on which page you found the answer, what kind of answer it is, and what kind of media (e.g. text, video) you found the answer in.",
      },
      {
        selector: '[data-tour="answer_type"]',
        content: "For some questions you might not be able to find an answer. That's fine - just leave the answer blank, select \"unanswerable\" as the type, and ask another question. It may be useful to ask a rephrased version of the question, or a version with more context, as the next question."
      },
      {
        selector: '[data-tour="answer_type"]',
        content: "When possible, we prefer extractive answers."
      },
      {
        selector: '[data-tour="add_answers"]',
        content: "If you find multiple different answers to a question (e.g. because you find disagreeing sources), you can write in additional answers. Please only add additional answers if you cannot rephrase the question so it yields a single answer."
      },
      {
        selector: '[data-tour="add"]',
        content: "If one question is not enough to give a verdict for the claim (independent of the fact-checking article), you can add more questions. We expect you will need at least two questions for each claim, often more. Please ask all questions necessary to gather the evidence needed for the verdict, including world knowledge that might seem obvious."
      },
      {
        selector: '[data-tour="verdict"]',
        content: "Once you have collected enough question-answer pairs to give a verdict, select the most fitting option here (regardless of which verdict the fact-checking article gave). If you have not found enough information to verify or refute the claim after five minutes, please choose 'Not Enough Information' and proceed to the next claim. If the verdict relies on approximations, use your own judgment to decide if you find the claim misleading."
      },
      {
        selector: '[data-tour="submit"]',
        content: "When you have verified the claim, submit your questions and your verdict. You will then be presented with a confirmation screen, after which you can proceed to the next article."
      },
    ];

    return (
      <QAPageDiv>
        {!this.state.confirmation ?
          <TourProvider steps={steps}>
            <QAPageView src={this.state.annotation_request.article.fact_checking_article} page_id={this.state.annotation_request._id} loadingDoneHandler={this.loadingDoneHandler} />
            <QADataField>
              <QuestionGenerationBar
                handleFieldChange={this.handleFieldChange}
                current_idx={this.state.current_idx}
                final_idx={this.state.final_idx}
                latest_idx={this.state.latest_idx}
                annotation={this.state.annotation_request.annotation}
                static_data={this.state.annotation_request}
                addEntry={this.addEntry}
                deleteEntry={this.deleteEntry}
                handleSkip={this.skipHandler}
                doSubmit={this.proceedToConfirmation}
                valid={this.state.valid}
                dataset={dataset}
                finish_path={this.props.finish_path}
                doNext={this.doNext}
                doPrevious={this.doPrevious}
                skip_enabled={this.state.skip_enabled}
              />
              <SearchField annotation_request={this.state.annotation_request} phase={2} dataset={this.props.dataset} />
            </QADataField>
            {this.state.userIsFirstVisiting ? <TourWrapper /> : ""}
          </TourProvider>
          :
          <QuestionGenerationConfirmation annotation_request={this.state.annotation_request} confirmFunction={this.doSubmit} cancelFunction={this.cancelConfirmation} current_idx={this.state.current_idx} final_idx={this.state.final_idx} changeLabel={this.changeLabel} />
        }
      </QAPageDiv>
    );
  }
}

export default QuestionGeneration;


import VerdictValidationBar from '../verdict_validation/VerdictValidationBar';
import React from 'react';
import ValidationClaimTopField from '../averitec_components/ValidationClaimTopField';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import StaticQuestionEntryField from '../averitec_components/StaticQuestionEntryField';
import Button from '@material-ui/core/Button';
import { notEmptyValidator, atLeastOneValidator } from '../utils/validation.js'
import NavBar from '../averitec_components/NavBar';
import PhaseControl from '../averitec_components/PhaseControl';
import { TourProvider } from "@reactour/tour";
import TourWrapper from '../components/TourWrapper';
import axios from "axios";
import { Redirect } from "react-router-dom";
import config from "../config.json";

const EntryCard = styled(Card)`
  margin:10px;
`

const RightPhaseControl = styled(PhaseControl)`
@media (max-width: 1290px)  {
  margin: 10px 10px 0px 10px;
}

@media (min-width: 1291px)  {
  height:260px;
  margin: 10px 10px 10px 0px;
}
`

const RightBox = styled.div`
  @media (max-width: 1290px)  {
    width:100%;
  }

  @media (min-width: 1291px)  {
    width:30%;
  }

  float: right;
`

const LeftBox = styled.div`
  @media (max-width: 1290px)  {
    width:100%;
  }

  @media (min-width: 1291px)  {
    width:70%;
  }

  float: left;
`

const QABox = styled.div`
  width: 100%;
  float: left;
  margin: -10px 0px 0px 0px;
`

function validate(content) {
    var valid = true

    if (!("label" in content) || notEmptyValidator(content["label"]).error) {
        valid = content["unreadable"];
    } else if (!("justification" in content) || notEmptyValidator(content["justification"]).error) {
        valid = false;
    }

    return valid;
}

class PhaseFiveVerdictValidation extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            annotation_request: {
                annotation: this.get_default_annotation(),
                p1_annotation: {
                    "claim": "",
                },
                p2_annotation: {
                    "should_correct": false,
                },
                has_been_submitted: false
            },
            request_timestamp: new Date(),
            userIsFirstVisiting: false,
            valid: true,
            current_idx: 0,
            final_idx: 0,
            confirmation: false,
            latest_idx: -1
        }

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.doSubmit = this.doSubmit.bind(this);
        this.doPrevious = this.doPrevious.bind(this);
        this.doNext = this.doNext.bind(this);
    }

    get_default_annotation = () => {
        return {
            questions: [
            ],
            work_seconds: 0,
        }
    }

    handleFieldChange(fieldId, element, value) {
        console.log("Field change " + fieldId + " " + element + " " + value)
        if (fieldId === "annotation") {
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
                                    [element]: value,
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

        console.log("Valid: " + validate(this.state.annotation_request.annotation));
        if (validate(this.state.annotation_request.annotation)) {
            let now_timestamp = new Date();
            let seconds_taken = (now_timestamp - this.state.request_timestamp) / 1000;
            let annotation_request = this.state.annotation_request;

            annotation_request.annotation.load_seconds = annotation_request.annotation.load_seconds ? annotation_request.annotation.load_seconds : seconds_taken;
            annotation_request.annotation.work_seconds = annotation_request.annotation.work_seconds ? annotation_request.annotation.work_seconds + seconds_taken : seconds_taken;

            annotation_request.submit_timestamp = now_timestamp;

            console.log("Submitting annotation request")
            var request = {
                method: "post",
                baseURL: config.api_url,
                url: "/annotations/submit/",
                data: {
                    annotation_request: annotation_request,
                    dataset: dataset,
                    phase: 5,
                    user_id: localStorage.getItem('user_id'),
                },
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            };

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
                url: "/annotations/p5/" + localStorage.getItem('user_id'),
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

                    // Deep copy questions from P4 annotation:
                    all_annotation_requests[current_idx].annotation.questions = all_annotation_requests[current_idx].p4_annotation.questions.map((question) => {
                        return {
                            question: question.question,
                            answers: question.answers.map((answer) => {
                                return {
                                    answer: answer.answer,
                                    boolean_explanation: answer.boolean_explanation,
                                    answer_type: answer.answer_type,
                                    source_url: answer.source_url,
                                    source_medium: answer.source_medium,
                                    cached_source_url: answer.cached_source_url
                                }
                            })
                        }
                    });
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


    componentDidMount() {
        this.updateData(true);
    }

    doNext() {
        this.setState({
            current_idx: this.state.current_idx + 1
        }, () => {
            this.updateData(false);
        }
        );
    }

    doPrevious() {
        this.setState({
            current_idx: this.state.current_idx - 1
        }, () => {
            this.updateData(false);
        }
        );
    }

    render() {
        var dataset = "annotation"
        if (this.props.dataset) {
            dataset = this.props.dataset
        }

        console.log("Current state:")
        console.log(this.state)

        if (!localStorage.getItem('token')) {
            return <Redirect to='/' />;
        }

        const steps = [
            {
                selector: '[data-tour="claim_text"]',
                content: "Begin by reading the claim."
            },
            {
                selector: '[data-tour="question_view"]',
                content: "Read the question-answer pairs supplied by your fellow annotators."
            },
            {
                selector: '[data-tour="verdict"]',
                content: "Give your verdict for the claim. Do not use prior knowledge you may have, or information from elsewhere on the internet - give your verdict based ONLY on the question-answer pairs."
            },
            {
                selector: '[data-tour="justification"]',
                content: "Write a short explanation explaining how you decided the answer based on the question-answer pairs."
            },
            {
                selector: '[data-tour="unreadable"]',
                content: "If the claim lacks context or is otherwise not understandable, please report it rather than giving a label. If you do so, please use the justification field to explain why the question cannot be understood."
            },
            {
                selector: '[data-tour="report_question_problems"]',
                content: "If there are any problems with a question, please report it. If you report a question, please DO NOT use the information in that question-answer pair to give your verdict."
            },
            {
                selector: '[data-tour="report_answer_problems"]',
                content: "Similarly, if there are any problems with an answer, please report it. If you report an answer, please DO NOT use the information in that answer to give your verdict. You can still use any other answers provided for the question."
            },
            {
                selector: '[data-tour="submit"]',
                content: "When you have verified the claim, submit your verdict and proceed to the next article."
            },
        ];

        var dataset = "annotation"
        if (this.props.dataset) {
            dataset = this.props.dataset
        }

        return (
            <div>
                <TourProvider steps={steps}>
                    <VerdictValidationBar
                        current_idx={this.state.current_idx}
                        final_idx={this.state.final_idx}
                        latest_idx={this.state.latest_idx}
                        annotation={this.state.annotation_request.annotation}
                        static_data={this.state.annotation_request}
                        valid={this.state.valid}
                        handleFieldChange={this.handleFieldChange}
                        doPrevious={this.doPrevious}
                        doSubmit={this.doSubmit}
                        doNext={this.doNext}
                        dataset={dataset}
                    />
                    {this.state.userIsFirstVisiting ? <TourWrapper /> : ""}
                </TourProvider>
            </div>
        );
    }
}

export default PhaseFiveVerdictValidation;

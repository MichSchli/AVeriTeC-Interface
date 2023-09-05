import React from 'react';
import MetadataEntryBar from './MetadataEntryBar';
import ClaimPageView from '../components/ClaimPageView';
import styled from 'styled-components';
import { TourProvider } from "@reactour/tour";
import TourWrapper from '../components/TourWrapper';
import axios from "axios";
import { Redirect } from "react-router-dom";
import config from "../config.json"
import { notEmptyValidator, atLeastOneValidator, emptyOrValidUrlValidator } from '../utils/validation.js'
import ClaimNormalizationConfirmation from './ClaimNormalizationConfirmation'

const NEntryBar = styled(MetadataEntryBar)`
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

const NPageView = styled(ClaimPageView)`
    width:60%;
    float:left;
    border-style:inset;
    border-width:2px;
    height: -webkit-calc(100% - 6px)!important;
    height:    -moz-calc(100% - 6px)!important;
    height:         calc(100% - 6px)!important;
`

const PageDiv = styled.div`
    width: 100%;
    height: 100vh;
`

function validate(content) {
    console.log(content)
    var valid = true

    Object.values(content.claims).forEach(entry => {
        if (!("fact_checking_strategies" in entry) || atLeastOneValidator(entry["fact_checking_strategies"]).error) {
            valid = false;
        } else if (!("claim_types" in entry) || atLeastOneValidator(entry["claim_types"]).error) {
            valid = false;
        } else if (!("label" in entry) || notEmptyValidator(entry["label"]).error) {
            valid = false;
        } else if (emptyOrValidUrlValidator(entry["original_claim_url"]).error) {
            valid = false;
        } else if (emptyOrValidUrlValidator(entry["media_source"]).error) {
            valid = false;
        } else if (!("claim" in entry) || notEmptyValidator(entry["claim"]).error) {
            valid = false;
        }
    });

    return valid;
}

class ClaimNormalization extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            annotation_request: {
                annotation: {
                    claims: [
                        this.get_default_claim(),
                    ],
                },
                article: {
                    "claim": "",
                    "fact_checking_article": "",
                    "fact_checking_date": new Date(),
                },
                load_seconds: 0,
                work_seconds: 0,
                has_been_submitted: false
            },
            request_timestamp: new Date(),
            userIsFirstVisiting: false,
            valid: true,
            current_idx: 0,
            final_idx: 0,
            confirmation: false,
        }

        this.doSubmit = this.doSubmit.bind(this);
        this.proceedToConfirmation = this.proceedToConfirmation.bind(this);
        this.cancelConfirmation = this.cancelConfirmation.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.loadingDoneHandler = this.loadingDoneHandler.bind(this);
    }

    get_default_claim = () => {
        return {
            "claim": "",
            "label": "",
            "claim_date": "",
            "speaker": "",
            "original_claim_url": "",
            "reporting_source": "",
            "location_ISO_code": "",
            "skipped": false,
            "claim_types": [
            ],
            "fact_checking_strategies": [
            ]
        }
    }

    deleteEntry = (entryId) => {
        let entries = this.state.annotation_request.annotation.claims
        entries.splice(entryId, 1)

        this.setState({
            annotation_request: {
                ...this.state.annotation_request,
                annotation: {
                    ...this.state.annotation_request.annotation,
                    claims: entries
                }
            }
        });
    }

    addEntry = () => {
        let entries = this.state.annotation_request.annotation.claims
        entries.push(this.get_default_claim())

        this.setState({
            annotation_request: {
                ...this.state.annotation_request,
                annotation: {
                    ...this.state.annotation_request.annotation,
                    claims: entries
                }
            }
        });
    }

    setEntries = (newEntries) => {
        this.setState({
            entries: newEntries
        })
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
                        claims: prevState.annotation_request.annotation.claims.map((entry, idx) => {
                            if (idx === fieldId) {
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
        
        let actual_finish_path = this.props.finish_path? this.props.finish_path : "/control/";

        console.log("Valid: " + validate(this.state.annotation_request.annotation));
        if (validate(this.state.annotation_request.annotation)) {
            let now_timestamp = new Date();
            let seconds_taken = (now_timestamp - this.state.request_timestamp) / 1000;
            let annotation_request = this.state.annotation_request;

            console.log("Current annotation request:")
            console.log(annotation_request)

            annotation_request.annotation.load_seconds = annotation_request.annotation.load_seconds? annotation_request.annotation.load_seconds : seconds_taken;
            annotation_request.annotation.work_seconds = annotation_request.annotation.work_seconds? annotation_request.annotation.work_seconds + seconds_taken: seconds_taken;

            annotation_request.submit_timestamp = now_timestamp;

            console.log("Submitting annotation request")
            var request = {
                method: "post",
                baseURL: config.api_url,
                url: "/annotations/submit/",
                data: {
                    annotation_request: annotation_request,
                    dataset: dataset,
                    phase: 1,
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
                    this.updateData();
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
        this.updateData();
    }

    updateData() {
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
                url: "/annotations/p1/" + localStorage.getItem('user_id'),
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

                // Set the current index to the first request that has not been submitted:
                let current_idx = 0;
                for (let i = 0; i < all_annotation_requests.length; i++) {
                    if (!all_annotation_requests[i].has_been_submitted) {
                        current_idx = i;
                        break;
                    }
                }
                this.setState({
                    current_idx: current_idx
                });

                // If the current annotation request has no annotation, add the one from the state as default:
                if (!all_annotation_requests[current_idx].annotation) {
                    all_annotation_requests[current_idx].annotation = this.state.annotation_request.annotation;
                }

                console.log(all_annotation_requests[current_idx]);

                // Memorize the current annotation request:
                this.setState({
                    annotation_request: all_annotation_requests[current_idx]
                });

                // If the user is visiting for the first time, set the flag:
                if (current_idx === 0) {
                    this.setState({
                        userIsFirstVisiting: true
                    });
                }

            }).catch((error) => { window.alert(error); });
        }
    }

    proceedToConfirmation() {
        console.log("Valid: " + validate(this.state.annotation_request.annotation));

        if (validate(this.state.annotation_request.annotation)) {
            if (this.needsConfirmation()) {
                this.setState({
                    confirmation: true
                });
            } else {
                this.doSubmit()
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

    claimNeedsConfirmation(claim) {
        return claim.transcription
            || (claim.claim_types
                && (claim.claim_types.includes("Speculative Claim") || claim.claim_types.includes("Opinion Claim")))
            || (claim.fact_checker_strategy
                && claim.fact_checker_strategy.includes("Media Source Discovery"))
    }

    needsConfirmation() {
        let needs_confirmation = false;
        this.state.annotation_request.annotation.claims.forEach(claim => {
            if (this.claimNeedsConfirmation(claim)) {
                needs_confirmation = true;
            }
        });

        return needs_confirmation;
    }

    skipHandler() {
        this.setState({
            annotation_request: {
                ...this.state.annotation_request,
                annotation: {
                    ...this.state.annotation_request.annotation,
                    skipped: true,
                    claims: []
                }
            }
        }).then(() => {
            this.doSubmit()
        });
    }

    loadingDoneHandler(seconds_taken) {
        let previous_load_seconds = this.state.annotation_request.annotation? this.state.annotation_request.annotation.load_seconds : 0;
        this.setState({
            annotation_request: {
                ...this.state.annotation_request,
                annotation: {
                    ...this.state.annotation_request.annotation,
                    load_seconds: seconds_taken + previous_load_seconds
                }
            }
        })
        console.log("Loading done!")
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

        const steps = [
            {
                selector: '[data-tour="claim_page_view"]',
                content: "Begin by carefully reading the fact-checking article. It may take a while to load - please allow at least a minute."
            },
            {
                selector: '[data-tour="report"]',
                content: "If the fact-checking article shows a 404 page or another error, or if the article is behind a paywall, you can report it to us (although please give it a minute to load - some sites are not very fast)."
            },
            {
                selector: '[data-tour="claim_textfield"]',
                content: "Fill in the text of the main claim the article is dealing with. Please edit the claim according to the instructions, but otherwise change it as little as possible. If there is a discrepancy between the original claim (e.g. a claim posted to Twitter) and the text of the claim in the fact-checking article, please stick as closely as possible to the original wording."
            },
            {
                selector: '[data-tour="verdict"]',
                content: "Select the closest verdict to the one chosen by the fact-checking article. Please mirror their verdict as well as you can, even if you disagree with it."
            },
            {
                selector: '[data-tour="metadata_fields"]',
                content: "Using the fact-checking article, fill in the rest of the data collection fields..."
            },
            {
                selector: '[data-tour="metadata_fields_2"]',
                content: "... and select the most appropriate claim types and fact checking strategies."
            },
            {
                selector: '[data-tour="add"]',
                content: "If the fact-checking article covers more than one claim, you can add additional claims. Some claims consist of multiple, easily separable, independent parts (e.g. \"The productivity rate in Scotland rose in 2017, and similarly productivity rose in Wales that year.\"). Please split these claims into their parts."
            },
            {
                selector: '[data-tour="submit"]',
                content: "When you have added all claims from this fact-checking article, submit your claims to proceed to the next article."
            },
        ];

        return (
            <PageDiv>
                {!this.state.confirmation ?
                    <TourProvider steps={steps}>
                        <NPageView src={this.state.annotation_request.article.fact_checking_article} loadingDoneHandler={this.loadingDoneHandler} />
                        <NEntryBar
                            handleFieldChange={this.handleFieldChange}
                            current_idx={this.state.current_idx + 1}
                            final_idx={this.state.final_idx}
                            annotation={this.state.annotation_request.annotation}
                            addEntry={this.addEntry}
                            deleteEntry={this.deleteEntry}
                            handleSkip={this.skipHandler}
                            doSubmit={this.proceedToConfirmation}
                            valid={this.state.valid}
                            dataset={dataset}
                            finish_path={this.props.finish_path}
                        />
                        {this.state.userIsFirstVisiting ? <TourWrapper /> : ""}
                    </TourProvider>
                    :
                    <ClaimNormalizationConfirmation confirmFunction={this.doSubmit} cancelFunction={this.cancelConfirmation} current_idx={this.state.current_idx + 1} final_idx={this.state.final_idx} entries={this.state.annotation_request.annotation.claims} />
                }
            </PageDiv>
        );
    }
}

export default ClaimNormalization;

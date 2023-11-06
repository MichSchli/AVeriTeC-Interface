import React from 'react';
import styled from 'styled-components';
import UserPanel from './UserPanel';
import AssignmentControl from './AssignmentControl';
import AdminControl from './AdminControl';
import { Redirect } from "react-router-dom";
import TrainingControl from './TrainingControl';
import PhaseStatsControl from './PhaseStatsControl';
import ReportControl from './ReportControl';
import config from "../config.json"
import axios from "axios";

const AssignmentField = styled(AssignmentControl)`
    width:33.333%;
    float:left;

    @media (max-width: 640px)  {
        width:320px;
    }

    @media (min-width: 640px) and (max-width: 960px)  {
        width:50%;
    }
    
    @media (min-width: 960px)  {
        width:33.333%;
    }
`

const ReportField = styled(ReportControl)`
    width:33.333%;
    float:left;

    @media (max-width: 640px)  {
        width:320px;
    }

    @media (min-width: 640px) and (max-width: 960px)  {
        width:50%;
    }
    
    @media (min-width: 960px)  {
        width:33.333%;
    }
`

const TrainingField = styled(TrainingControl)`
    width:33.333%;
    float:left;

    @media (max-width: 640px)  {
        width:320px;
    }

    @media (min-width: 640px) and (max-width: 960px)  {
        width:50%;
    }
    
    @media (min-width: 960px)  {
        width:33.333%;
    }
`

const AdminPanel = styled.div`
    width: 100%;
    float: left;
`

const SepDiv = styled("div")`
    width:100%;
    float:left;
    height:0px;
`

class AnnotatorControl extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {
                username: localStorage.getItem('username'),
                is_admin: localStorage.getItem('is_admin') === "true"
            },
            logged_in: localStorage.getItem('token') !== undefined,
            reports_initial: {
                phase_1: {
                    done: 0,
                    total: 0
                },
                phase_2: {
                    done: 0,
                    total: 0
                },
                phase_3: {
                    done: 0,
                    total: 0
                },
                phase_4: {
                    done: 0,
                    total: 0
                },
                phase_5: {
                    done: 0,
                    total: 0
                }
            },
            reports_confirm: {
                phase_1: {
                    done: 0,
                    total: 0
                },
                phase_2: {
                    done: 0,
                    total: 0
                },
                phase_3: {
                    done: 0,
                    total: 0
                },
                phase_4: {
                    done: 0,
                    total: 0
                },
                phase_5: {
                    done: 0,
                    total: 0
                }
            },
            assignments: {
                phase_1: {
                    done: 0,
                    total: 0
                },
                phase_2: {
                    done: 0,
                    total: 0
                },
                phase_3: {
                    done: 0,
                    total: 0
                },
                phase_4: {
                    done: 0,
                    total: 0
                },
                phase_5: {
                    done: 0,
                    total: 0
                },
                phase_1_training: {
                    done: 0,
                    total: 0
                },
                phase_2_training: {
                    done: 0,
                    total: 0
                },
                phase_3_training: {
                    done: 0,
                    total: 0
                }
            }
        }
    }

    componentDidMount() {
        console.log(localStorage.getItem('token'))
        var request = {
            method: "get",
            baseURL: config.api_url,
            url: "/users/statistics/" + localStorage.getItem('user_id'),
            data: {
            },
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        };

        axios(request).then((response) => {
            console.log(response);
            this.setState({
                assignments: {
                    phase_1: {
                        done: response.data.phase_1.annotations_done,
                        total: response.data.phase_1.annotations_assigned
                        // done: 0,
                        // total: 10
                    },
                    phase_2: {
                        done: response.data.phase_2.annotations_done,
                        total: response.data.phase_2.annotations_assigned
                        // done: 0,
                        // total: 10
                    },
                    phase_3: {
                        done: response.data.phase_3.annotations_done,
                        total: response.data.phase_3.annotations_assigned
                        // done: 0,
                        // total: 10
                    },
                    phase_4: {
                        done: response.data.phase_4.annotations_done,
                        total: response.data.phase_4.annotations_assigned,
                        // done: 0,
                        // total: 0
                    },
                    phase_5: {
                        done: response.data.phase_5.annotations_done,
                        total: response.data.phase_5.annotations_assigned
                        // done: 0,
                        // total: 0
                    },
                    phase_1_training: {
                        done: response.data.phase_1_training.annotations_done,
                        total: response.data.phase_1_training.annotations_assigned
                        // done: 0,
                        // total: 0
                    },
                    phase_2_training: {
                        done: response.data.phase_2_training.annotations_done,
                        total: response.data.phase_2_training.annotations_assigned
                        // done: 0,
                        // total: 0
                    },
                    phase_3_training: {
                        done: response.data.phase_3_training.annotations_done,
                        total: response.data.phase_3_training.annotations_assigned
                        // done: 0,
                        // total: 0
                    },
                }
            })

        }).catch((error) => { window.alert(error) });

        // If the user is admin, also get reports
        if (this.state.user.is_admin) {
            var request = {
                method: "get",
                baseURL: config.api_url,
                url: "/reports/overview",
                data: {
                },
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            };

            axios(request).then((response) => {
                this.setState({
                    reports_initial: response.data.reports_initial,
                    reports_confirm: response.data.reports_confirm
                });
            }).catch((error) => { window.alert(error) });
        }
    }

    render() {
        console.log("Rendering AnnotatorControl")
        console.log(this.state)
        console.log(this.state.user.is_admin)
        if (!this.state.logged_in) {
            return <Redirect to='/' />;
        }

        return (
            <div>
                <UserPanel user={this.state.user} />
                <div>
                    {(this.state.assignments.phase_1.total > 0) ? <AssignmentField name="Claim Normalization" page="phase_1" assignments={this.state.assignments.phase_1} /> : ""}
                    {(this.state.assignments.phase_2.total > 0) ? <AssignmentField name="Question Generation" page="phase_2" assignments={this.state.assignments.phase_2} /> : ""}
                    {(this.state.assignments.phase_3.total > 0) ? <AssignmentField name="Quality Control" page="phase_3" assignments={this.state.assignments.phase_3} /> : ""}
                    {(this.state.assignments.phase_4.total > 0) ? <AssignmentField name="Dispute Resolution" page="phase_4" assignments={this.state.assignments.phase_4} /> : ""}
                    {(this.state.assignments.phase_5.total > 0) ? <AssignmentField name="Post-Resolution Quality Control" page="phase_5" assignments={this.state.assignments.phase_5} /> : ""}
                </div>
                <SepDiv />
                <div>
                    {(this.state.assignments.phase_1_training.total > 0) ? <TrainingField name="Claim Normalization" page="phase_1" assignments={this.state.assignments.phase_1_training} /> : ""}
                    {(this.state.assignments.phase_2_training.total > 0) ? <TrainingField name="Question Generation" page="phase_2" assignments={this.state.assignments.phase_2_training} /> : ""}
                    {(this.state.assignments.phase_3_training.total > 0) ? <TrainingField name="Quality Control" page="phase_3" assignments={this.state.assignments.phase_3_training} /> : ""}
                </div>
                <SepDiv />
                {(this.state.user.is_admin === true) ?
                    <div>
                        {(this.state.reports_initial.phase_1.total > 0) ? <ReportField name="P1 Report Initial" page="reports_initial" phase={1} done={this.state.reports_initial.phase_1.done} total={this.state.reports_initial.phase_1.total} /> : ""}
                        {(this.state.reports_initial.phase_2.total > 0) ? <ReportField name="P2 Report Initial" page="reports_initial" phase={2} done={this.state.reports_initial.phase_2.done} total={this.state.reports_initial.phase_2.total} /> : ""}
                        {(this.state.reports_initial.phase_3.total > 0) ? <ReportField name="P3 Report Initial" page="reports_initial" phase={3} done={this.state.reports_initial.phase_3.done} total={this.state.reports_initial.phase_3.total}/> : ""}
                        {(this.state.reports_initial.phase_4.total > 0) ? <ReportField name="P4 Report Initial" page="reports_initial" phase={4} done={this.state.reports_initial.phase_4.done} total={this.state.reports_initial.phase_4.total}/> : ""}
                        {(this.state.reports_initial.phase_5.total > 0) ? <ReportField name="P5 Report Initial" page="reports_initial" phase={5} done={this.state.reports_initial.phase_5.done} total={this.state.reports_initial.phase_5.total}/> : ""}
                        {(this.state.reports_confirm.phase_1.total > 0) ? <ReportField name="P1 Report Confirm" page="reports_confirm" phase={1} done={this.state.reports_confirm.phase_1.done} total={this.state.reports_confirm.phase_1.total}/> : ""}
                        {(this.state.reports_confirm.phase_2.total > 0) ? <ReportField name="P2 Report Confirm" page="reports_confirm" phase={2} done={this.state.reports_confirm.phase_2.done} total={this.state.reports_confirm.phase_2.total}/> : ""}
                        {(this.state.reports_confirm.phase_3.total > 0) ? <ReportField name="P3 Report Confirm" page="reports_confirm" phase={3} done={this.state.reports_confirm.phase_3.done} total={this.state.reports_confirm.phase_3.total}/> : ""}
                        {(this.state.reports_confirm.phase_4.total > 0) ? <ReportField name="P4 Report Confirm" page="reports_confirm" phase={4} done={this.state.reports_confirm.phase_4.done} total={this.state.reports_confirm.phase_4.total}/> : ""}
                        {(this.state.reports_confirm.phase_5.total > 0) ? <ReportField name="P5 Report Confirm" page="reports_confirm" phase={5} done={this.state.reports_confirm.phase_5.done} total={this.state.reports_confirm.phase_5.total}/> : ""}
                    </div>
                    : ""}
                {(this.state.user.is_admin === true) ? <AdminPanel>
                    <AdminControl name="Users" />
                    <PhaseStatsControl phase={1} name={"Analysis | Claim Normalization"} />
                    <PhaseStatsControl phase={2} name={"Analysis | Question Generation"} />
                    <PhaseStatsControl phase={3} name={"Analysis | Quality Control"} />
                    <PhaseStatsControl phase={4} name={"Analysis | Dispute Resolution"} />
                    <PhaseStatsControl phase={5} name={"Analysis | Post-Resolution Quality Control"} />
                </AdminPanel> : ""}
            </div>
        );
    }
}

export default AnnotatorControl;

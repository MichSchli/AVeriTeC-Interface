import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import MetadataEntryBar from '../claim_normalization/MetadataEntryBar';
import axios from "axios";
import config from "../config.json"
import Card from '@material-ui/core/Card';
import moment from "moment";
import QuestionGenerationBar from "../question_generation/QuestionGenerationBar"
import VerdictValidationBar from '../verdict_validation/VerdictValidationBar';
import PhaseFourQuestionGenerationBar from '../phase_four_question_generation/PhaseFourQuestionGenerationBar';
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@material-ui/core/Button';

const SubmitButton = styled(Button)`
float:left;
width:200px;
margin:10px 0px 10px 10px!important;
`

const AnnotationView = styled("div")`
    width: -webkit-calc(50% - 4px)!important;
    width:    -moz-calc(50% - 4px)!important;
    width:         calc(50% - 4px)!important;
    float:left;
    border-style:inset;
    border-width:2px;
    height: -webkit-calc(100vh - 68px)!important;
    height:    -moz-calc(100vh - 68px)!important;
    height:         calc(100vh - 68px)!important;
    overflow: auto;
`

const WhiteLink = styled.a`
  color:white;
`

const NavButton = styled(IconButton)`
  width:55px;
  height:53px;
`
const PrevButton = styled(NavButton)`
  float: left;
`
const NextButton = styled(NavButton)`
  float: right;
`

const EntryCard = styled(Card)`
  margin:10px;
  text-align:center;
`

const BarPartBox = styled("div")`
  width: 100%;
  float:left;
`

const ButtonBox = styled("div")`
  width: 100%;
  float:left;
  margin: 10px -webkit-calc(50% - 215px)!important;
  margin: 10px    -moz-calc(50% - 215px)!important;
  margin: 10px         calc(50% - 215px)!important;
`

const PaddingTypographBox = styled(Typography)`
  padding: 10px 24px 10px 134px;
  width: -webkit-calc(100% - 398px)!important;
  width:    -moz-calc(100% - 398px)!important;
  width:         calc(100% - 398px)!important;
  float:left;
  text-align:center;
`

const ContinueTypographBox = styled(Typography)`
  padding: 10px 24px;
  float:right;
  color:white;
  text-decoration:underline;
`

const ShoveBox = styled("div")`
  width: 1px;
  height: 64px;
`

const SepBox = styled("div")`
  width: 100%;
  height: 64px;
`

const P3SepDiv = styled("div")`
  width: 100%;
  height: 1px;
  margin: -11px;
  clear:both;
`

class ReportOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      reports: [],
      shown_report_id: 0,
    }

    this.moveForward = this.moveForward.bind(this);
    this.moveBackward = this.moveBackward.bind(this);
    this.canMoveForward = this.canMoveForward.bind(this);
    this.canMoveBackward = this.canMoveBackward.bind(this);
    this.doSubmit = this.doSubmit.bind(this);
  }

  componentDidMount() {
    console.log("Loading report overview for phase " + this.props.phase)

    let phase_id = this.props.phase

    let desired_status = "pending"
    if (this.props.is_confirmation_view) {
      desired_status = "submitted"
    }

    if (localStorage.getItem('token')) {
      console.log("I'm getting fresh for phase " + phase_id);
      var request = {
        method: "post",
        baseURL: config.api_url,
        url: "/reports/all",
        data: {
          phase: phase_id,
          status: desired_status
        },
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };

      axios(request).then((response) => {
        let all_reports = response.data.reports;

        console.log("Register all reports")
        console.log(all_reports)

        this.setState({
          reports: all_reports
        });
      }).catch((error) => { window.alert(error); });
    }
  }

  doSubmit(status) {
    console.log("Submitting report overview for phase " + this.props.phase)

    let phase_id = this.props.phase

    let submitReport = this.state.reports[this.state.shown_report_id]
    submitReport.status = status

    if (localStorage.getItem('token')) {
      console.log("I'm submitting a report for " + phase_id);
      var request = {
        method: "post",
        baseURL: config.api_url,
        url: "/reports/update",
        data: {
          report: submitReport
        },
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };

      axios(request).then((response) => {
        console.log("Submitted current report")
        if (this.canMoveForward()) {
          this.moveForward()
        } else {
          window.location.href = "/control"
        }
      }).catch((error) => { window.alert(error); });
    }
  }

  canMoveBackward() {
    return this.state.shown_report_id > 0
  }

  canMoveForward() {
    return this.state.shown_report_id + 1 < this.state.reports.length
  }

  moveForward() {
    if (this.canMoveForward()) {
      console.log("Moving to report " + (this.state.shown_report_id + 1))
      this.setState({
        shown_report_id: this.state.shown_report_id + 1
      }, this.fillPhase)
    }
  }

  moveBackward() {
    if (this.canMoveBackward()) {
      console.log("Moving to claim " + (this.state.shown_report_id - 1))
      this.setState({
        shown_report_id: this.state.shown_report_id - 1
      }, this.fillPhase)
    }
  }

  render() {
    var current_idx = 0
    var final_idx = 0

    if (this.state.reports.length == 0) {
      return <div>No reports. You should not see this screen.</div>
    }

    let annotation = this.state.reports[this.state.shown_report_id].annotationRequest.annotation;
    let annotationRequest = this.state.reports[this.state.shown_report_id].annotationRequest;
    if (!annotation) {
      annotation = {}
    }

    let DisplayClass = MetadataEntryBar
    if (this.props.phase === 2) {
      DisplayClass = QuestionGenerationBar
    } else if (this.props.phase === 3) {
      DisplayClass = VerdictValidationBar
    } else if (this.props.phase === 4) {
      DisplayClass = PhaseFourQuestionGenerationBar
    } else if (this.props.phase === 5) {
      DisplayClass = VerdictValidationBar
    }

    let annotator_view = <DisplayClass posthocView={true} current_idx={current_idx} final_idx={final_idx} annotation={annotation} static_data={annotationRequest} />

    let this_report = this.state.reports[this.state.shown_report_id]

    let is_confirmation_view = this.props.is_confirmation_view

    console.log(this.state)
    console.log("Reporttt")
    console.log(this_report)

    return (
      <div>
        <AppBar>
          <Toolbar>
            <BarPartBox>
              {this.canMoveBackward() ?
                <PrevButton onClick={this.moveBackward}><NavigateBeforeIcon fontSize="large" style={{ color: 'white' }} /></PrevButton>
                :
                <PrevButton onClick={() => { }}><NavigateBeforeIcon fontSize="large" disabled style={{ color: 'grey' }} /></PrevButton>
              }
              <PaddingTypographBox variant="h6" component="div">
                Report Overview | Phase {this.props.phase} | Report {this.state.shown_report_id + 1} of {this.state.reports.length}
              </PaddingTypographBox>
              {this.canMoveForward() ?
                <NextButton onClick={this.moveForward}><NavigateNextIcon fontSize="large" style={{ color: 'white' }} /></NextButton>
                :
                this.props.finish_path ?
                  <WhiteLink href={this.props.finish_path}><ContinueTypographBox variant="h6" component="div">Continue</ContinueTypographBox></WhiteLink> :
                  <WhiteLink href={"/control"}><ContinueTypographBox variant="h6" component="div">Exit</ContinueTypographBox></WhiteLink>
              }
            </BarPartBox>
          </Toolbar>
        </AppBar>
        <ShoveBox />

        <AnnotationView>
          <EntryCard>
            <h3>Entered Annotation</h3>
          </EntryCard>
          {annotator_view}
        </AnnotationView>
        <AnnotationView>
          <EntryCard>
          <FormControl
            size="small"
            sx={{
              margin: "8px",
              width: 400
            }}>
            <InputLabel shrink>Report Reason</InputLabel>
            <Select label={"report_reason"} disabled={is_confirmation_view} value={this_report.reportReason? this_report.reportReason : ""} onChange={
              (event) => {
                this.setState({
                  reports: this.state.reports.map((report, idx) => {
                    if (idx == this.state.shown_report_id) {
                      report.reportReason = event.target.value
                    }
                    return report
                  }
                  )
                });
              }
            }>
              <MenuItem value={"dummy"}>Dummy Reason</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={{
              margin: "8px",
              width: 400
            }}>
            <InputLabel shrink>Suggested Action</InputLabel>
            <Select label={"report_action"} disabled={is_confirmation_view} value={this_report.suggestedAction? this_report.suggestedAction : ""} onChange={
              (event) => {
                this.setState({
                  reports: this.state.reports.map((report, idx) => {
                    if (idx == this.state.shown_report_id) {
                      report.suggestedAction = event.target.value
                    }
                    return report
                  }
                  )
                });
              }
            }>
              <MenuItem value={"warn_and_keep"}>Warn user, but keep annotation</MenuItem>
              <MenuItem value={"reannotate"}>Reannotate</MenuItem>
            </Select>
          </FormControl>
          <ButtonBox>
          <SubmitButton variant="contained" color="error" onClick={() => {
            let status = "skipped"
            if (is_confirmation_view) {
              status = "rejected"
            }
            this.doSubmit(status)
          }}>
            Reject
          </SubmitButton>
          <SubmitButton variant="contained" color="primary" onClick={() => {
            let status = "submitted"
            if (is_confirmation_view) {
              status = "accepted"
            }
            this.doSubmit(status)
            }}>
            Submit
          </SubmitButton>
          </ButtonBox>
          </EntryCard>
        </AnnotationView>
      </div>
    );
  }
}

export default ReportOverlay;
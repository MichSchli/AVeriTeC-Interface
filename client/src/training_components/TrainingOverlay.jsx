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
import IconButton from '@material-ui/core/IconButton';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';

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

class TrainingOverlay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      shown_annotation_id: 0,
      annotationRequests: [],
    }

    this.moveForward = this.moveForward.bind(this);
    this.moveBackward = this.moveBackward.bind(this);
  }

  componentDidMount() {
    console.log("Loading training overview for phase " + this.props.phase)

    let phase_id = "p" + this.props.phase

    if (localStorage.getItem('token')) {
      console.log("I'm getting annotations for phase " + phase_id);
      var request = {
        method: "post",
        baseURL: config.api_url,
        url: "/annotations/" + phase_id + "/" + localStorage.getItem('user_id'),
        data: {
          dataset: "training",
        },
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      };

      axios(request).then((response) => {
        let all_annotation_requests = response.data.annotationRequests;

        // Remove requests with no user annotation
        all_annotation_requests = all_annotation_requests.filter((annotationRequest) => {
          return annotationRequest.annotation
        })

        console.log("Register all requests")

        console.log(all_annotation_requests)
        this.setState({
          annotationRequests: all_annotation_requests
        });
      }).catch((error) => { window.alert(error); });
    }
  }

  canMoveBackward() {
    return this.state.shown_annotation_id > 0
  }

  canMoveForward() {
    return this.state.shown_annotation_id + 1 < this.state.annotationRequests.length
  }

  moveForward() {
    if (this.canMoveForward()) {
      console.log("Moving to claim " + (this.state.shown_annotation_id + 1))
      this.setState({
        shown_annotation_id: this.state.shown_annotation_id + 1
      }, this.fillPhase)
    }
  }

  moveBackward() {
    if (this.canMoveBackward()) {
      console.log("Moving to claim " + (this.state.shown_annotation_id - 1))
      this.setState({
        shown_annotation_id: this.state.shown_annotation_id - 1
      }, this.fillPhase)
    }
  }

  render() {
    var current_idx = 0
    var final_idx = 0

    if (this.state.annotationRequests.length == 0) {
      return <div></div>
    }

    console.log(this.state)

    let annotator_view = ""
    let gold_view = ""

    let annotation = this.state.annotationRequests[this.state.shown_annotation_id].annotation;
    let annotationRequest = this.state.annotationRequests[this.state.shown_annotation_id];
    if (!annotation) {
      annotation = {}
    }

    let gold_annotations = this.state.annotationRequests[this.state.shown_annotation_id].gold_annotations;

    let DisplayClass = MetadataEntryBar
    if (this.props.phase === 2) {
      DisplayClass = QuestionGenerationBar
    } else if (this.props.phase === 3) {
      DisplayClass = VerdictValidationBar
    }

    annotator_view = <DisplayClass posthocView={true} current_idx={current_idx} final_idx={final_idx} annotation={annotation} static_data={annotationRequest} />

    gold_view = gold_annotations.map((annotation, index) => {
      return <div>
        <SepBox>
          <EntryCard>
            <h3>Suggested Annotation #{index + 1}</h3>
          </EntryCard>
        </SepBox>
        <DisplayClass posthocView={true} annotation={annotation} static_data={annotationRequest} />
      </div>
    })

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
                Training Annotation Overview | Phase {this.props.phase} | Example {this.state.shown_annotation_id + 1}
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
            <h3>Your Annotation</h3>
          </EntryCard>
          {annotator_view}
        </AnnotationView>
        <AnnotationView>
          {gold_view}
        </AnnotationView>
      </div>
    );
  }
}

export default TrainingOverlay
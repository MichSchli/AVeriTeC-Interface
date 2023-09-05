import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Login from './login/Login';
import Registration from './login/Registration';
import ChangePassword from './login/ChangePassword';
import AnnotatorControl from './control_panels/AnnotatorControl';

import TrainingOverlay from './training_components/TrainingOverlay';
import PreTrainingControl from './training_components/PreTrainingControl';
import MidTrainingControl from './training_components/MidTrainingControl';
import PostTrainingControl from './training_components/PostTrainingControl';
import PostReviewTrainingControl from './training_components/PostReviewTrainingControl';

import ClaimNormalization from './claim_normalization/ClaimNormalization';

import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
/*import QuestionGeneration from './question_generation/QuestionGeneration';
import VerdictValidation from './verdict_validation/VerdictValidation';
import PostPhaseOneScreen from './claim_normalization/PostPhaseOneScreen';
import PrePhaseOneScreen from './claim_normalization/PrePhaseOneScreen';
import PostPhaseTwoScreen from './question_generation/PostPhaseTwoScreen';
import PrePhaseTwoScreen from './question_generation/PrePhaseTwoScreen';
import PrePhaseThreeScreen from './verdict_validation/PrePhaseThreeScreen';
import UserDetailsOverview from './control_panels/UserDetailsOverview';
import PrePhaseFourScreen from './phase_four_question_generation/PrePhaseFourScreen';
import PostPhaseFourScreen from './phase_four_question_generation/PostPhaseFourScreen';
import PhaseFourQuestionGeneration from './phase_four_question_generation/PhaseFourQuestionGeneration';
import PrePhaseFiveScreen from './phase_five_verdict_validation/PrePhaseFiveScreen';
import PostPhaseFiveScreen from './phase_five_verdict_validation/PostPhaseFiveScreen';
import PhaseFiveVerdictValidation from './phase_five_verdict_validation/PhaseFiveVerdictValidation';*/

const routing = (
  <Router>
      <header>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </header>
      <Switch>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="/login">
            <Login/>
          </Route>
          <Route path="/register">
            <Registration />
          </Route>
          <Route path="/change_password">
            <ChangePassword/>
          </Route>
          <Route path="/control">
            <AnnotatorControl />
          </Route>

          <Route path="/training/phase_1/task_1_start">
            <PreTrainingControl phase={1} taskLink="/training/phase_1/task_1"/>
          </Route>
          <Route path="/training/phase_1/task_1">
            <ClaimNormalization dataset="training" finish_at={10} finish_path="/training/phase_1/complete"/>
          </Route>
          <Route path="/training/phase_1/mid">
            <MidTrainingControl phase={1} taskLink="/training/phase_1/mid_review"/>
          </Route>
          <Route path="/training/phase_1/mid_review">
            <TrainingOverlay phase={1} finish_path="/training/phase_1/task_2_start"/>
          </Route>
          <Route path="/training/phase_1/task_2_start">
            <PostReviewTrainingControl phase={1} taskLink="/training/phase_1/task_2"/>
          </Route>
          <Route path="/training/phase_1/task_2">
            <ClaimNormalization dataset="training" finish_path="/training/phase_1/complete"/>
          </Route>
          <Route path="/training/phase_1/complete">
            <PostTrainingControl phase={1}  reviewLink="/training/phase_1/review" start_at={10}/>
          </Route>
          <Route path="/training/phase_1/review">
            <TrainingOverlay phase={1}/>
          </Route>
      </Switch>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));

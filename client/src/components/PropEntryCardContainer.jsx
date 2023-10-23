import React from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import NavBar from '../averitec_components/NavBar';
import axios from "axios";
import config from "../config.json";

const EntryCard = styled(Card)`
  margin:10px;
`

const AddEntryCard = styled(EntryCard)`
text-align: center;
cursor: pointer;
padding-top: 5px;
`

const SubmitButton = styled(Button)`
float:right;
width:120px;
margin:10px !important;
`

const DeleteButton = styled(IconButton)`
  float: right;
  width:40px;
`

class EntryCardContainer extends React.Component {
  constructor(props) {
    super(props);
  }


  render() {
    let entry_count = 0;
    let entryFields = ""
    if (this.props.entries) {
      entry_count = Object.keys(this.props.entries).length
    }

    console.log("Rendering " + entry_count + " entries.")
    console.log(this.props.annotation)

    //if (this.props.annotation) {
    //  console.log("Annotation")
    //  console.log(this.props.annotation)
    //  this.props.annotation.claims = [
    //    ...this.props.annotation.claims,
    //    "fisk"
    //  ]
    //  console.log(this.props.annotation)
    //}

    console.log("Entries")
    if (entry_count > 0) {
      entryFields = this.props.entries.map( (element, index) => (
        console.log(element),
        console.log("Index: " + index),        
        <EntryCard variant="outlined">
          {!this.props.posthocView && (entry_count > 1 || this.props.extra_entries) ? <DeleteButton onClick={() => this.props.deleteEntry(index)}><ClearIcon /></DeleteButton> : ""}
          <this.props.contentClass
            key={"entry_" + index}
            id={index}
            onChange={this.props.handleFieldChange}
            valid={this.props.valid}
            data={element}
            {...this.props}
          />
        </EntryCard>
      ));
    }

    console.log("Extra entries")
    console.log(this.props.extra_entries)

    if (this.props.extra_entries) {
      let extraEntries = Object.keys(this.props.extra_entries).map(field_id => (
        <EntryCard data-tour="prev_verdict" variant="outlined">
          <DeleteButton onClick={() => this.props.deleteExtraEntry(field_id)}><ClearIcon /></DeleteButton>
          <this.props.contentClass
            key={field_id}
            id={field_id}
            onChange={this.props.handleExtraFieldChange}
            valid={true}
            data={this.props.extra_entries[field_id]}
            claim={this.props.claim}
            removeDelete={true}
            {...this.props}
          />
        </EntryCard>
      ));

      entryFields = [
        ...extraEntries,
        ...entryFields
      ]
    }

    console.log("entry")
    console.log(this.props)


    if (this.props.headerClass != null) {
      var headerField = <this.props.headerClass
        key={"claim_header"}
        id={"claim_header"}
        onChange={this.props.handleFieldChange}
        valid={this.props.valid}
        data={this.props.annotation}
        static_data={this.props.static_data}
        {...this.props}
      />;
    };

    if (this.props.footerClass != null) {
      var footerField = <this.props.footerClass
        key={"claim_footer"}
        id={"claim_footer"}
        onChange={this.props.handleFieldChange}
        valid={this.props.valid}
        data={this.props.annotation}
        static_data={this.props.static_data}
        {...this.props}
      />;
    }

    return (
      <div>
        {headerField}
        {entryFields}
        {!this.props.posthocView ?
          <Tooltip title={this.props.addTooltip}>

            <AddEntryCard data-tour="add" onClick={this.props.addEntry} variant="outlined">
              <AddCircleIcon />
            </AddEntryCard>
          </Tooltip>
          : ""
        }
        {footerField}
        {!this.props.posthocView ?
          <NavBar onPrevious={this.props.doPrevious} onSubmit={this.props.doSubmit} onNext={this.props.doNext} current_idx={this.props.current_idx} latest_idx={this.props.latest_idx} /> : ""
        }
      </div>
    );
  }
}

export default EntryCardContainer

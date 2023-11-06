import React from 'react';
import Card from '@material-ui/core/Card';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';

const EntryCard = styled(Card)`
    margin:10px;
    padding: 0px 20px 5px 20px;
`

const Header = styled.h4`
`

const StartButton = styled(Button)`
float:right;
width:120px;
margin:10px 0px 10px 10px!important;
`

const CountBox = styled.div`
float:left;
width:110px;
height:30px;
margin:30px 0px 0px 0px!important;
`


class ReportControl extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let className = ''

        if(this.props.className !== undefined){
            className = this.props.className
        }

        var assignments = "Finished " + this.props.done + "/" + this.props.total + "."

        var nextAssignmentLink = this.props.page + "/phase_" + this.props.phase

        return (
            <div className={className}>
                <EntryCard>
                    <Header>Reports: {this.props.name}</Header>
                    <CountBox>{assignments}</CountBox>

                    {this.props.done === 0?
                        <StartButton variant="contained" color="primary" disabled={this.props.done == this.props.total} onClick={(e) => {
                            e.preventDefault();
                            window.location.assign(nextAssignmentLink);
                            }}>
                            Start
                        </StartButton>
                        :
                        <StartButton variant="contained" color="primary" disabled={this.props.done == this.props.total} onClick={(e) => {
                            e.preventDefault();
                            window.location.assign(nextAssignmentLink);
                            // TODO make sure we start the right location
                            }}>
                            Resume
                        </StartButton>               
                    }
                </EntryCard> 
            </div>
        );
    }
}

export default ReportControl;
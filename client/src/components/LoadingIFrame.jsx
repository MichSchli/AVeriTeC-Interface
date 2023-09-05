import { maxHeight } from '@mui/system';
import React, { useEffect } from 'react';
import Spinner from 'react-spinkit';
import styled from 'styled-components';
import config from "../config.json"
import axios from 'axios';
import { useRef } from 'react';
import { useState } from 'react';
import ReactIFrame from 'react-onload-iframe';

const FullFrame = styled.iframe`
    width:100%;
    border:none;
`

const StyledSpinner = styled(Spinner)`
    width:80px;
    height:80px;
    border: 1px solid transparent;
    display: block;

    margin: -webkit-calc(50vh - 60px) 0px 0px -webkit-calc(50% - 40px)!important;
    margin: -moz-calc(50vh - 60px) 0px 0px -moz-calc(50% - 40px)!important;
    margin: calc(50vh - 60px) 0px 0px calc(50% - 40px)!important;
`

function LoadingIFrame(props) {
  const frameRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const loading_start_time = new Date()

  console.log("LoadingIFrame props:")
  console.log(props)

  /*useEffect(() => {
    setTimeout(() => {
      console.log("Page timed out. Removing loading wheel...")
      setLoading(false)
      props.loadingDoneHandler(30)
    }, 30000);
  }, [])*/

  const frameHasLoaded = () => {
    var loading_stop_time = new Date();

    var seconds_taken = (loading_stop_time.getTime() - loading_start_time.getTime()) / 1000;
    console.log(
      "Loading started at " + loading_start_time.toUTCString() + " and finished at " + loading_stop_time.toUTCString() + ". Loading took " + seconds_taken + " seconds."
    )
    setLoading(false)

    props.loadingDoneHandler(seconds_taken)
  };

  console.log("Loading: " + props.src)
  let className = ''

  if (props.className !== undefined) {
    className = props.className
  }

  let iframeStyle = {
    visibility: loading ? 'hidden' : 'visible',
    height: loading ? '0px' : '100%'
  }

  // If the src starts with http://, replace with https://. If neither, add https://
  let src = props.src
  if (src) {
    if (src.startsWith("http://")) {
      src = src.replace("http://", "https://")
    } else if (!src.startsWith("https://")) {
      src = "https://" + src
    }
  }

  return (
    <div className={className}>
      {loading ? <div style={{ height: '1px' }} /> : null}
      {loading ? (
        <StyledSpinner
          name="circle"
        />
      ) : null}
      {src != null ? <FullFrame
        style={iframeStyle}
        src={src}
        onLoad={frameHasLoaded}
      /> : null}

    </div>
  );
}

export default LoadingIFrame;
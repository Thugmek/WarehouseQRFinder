import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';
import { useParams } from "react-router-dom";
import QrReader from 'react-qr-scanner'

function SetBox() {
  const title = 'Set Box';

  const [boxId, setBoxId] = useState();
  console.log(boxId)

  function handleScan(data){
    if (data){
      console.log(data)
      setBoxId(data.text)
    }
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="container-fluid">
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">{title}</h1>
        </div> 
        <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
        {boxId?
        <h1>{boxId}</h1>
        :
        <QrReader
        className = "base-image"
        delay={100}
        onError={console.error}
        onScan={handleScan}
        />}
        </div>
      </div>
    </>
  );
}

export default SetBox;

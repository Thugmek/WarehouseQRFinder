import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';
import { useParams } from "react-router-dom";

function FindBox() {
  let { box_id } = useParams();

  const title = 'Find Box '+box_id;

  const [data, setData] = useState();

  useEffect(() => {
    fetch('http://localhost:5000/find/'+box_id, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log("data", data)
        setData(data)
      })
  }, []);

  return (
    <>
      <Helmet>
        <title>Find Box {box_id}</title>
      </Helmet>
      <div className="container-fluid">
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">Find Box <Badge bg="secondary">{box_id}</Badge></h1>
        </div>
        {data && 
        <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
          <img className='box-image' src={"data:image/jpg;base64,"+data.image} />
        </div>}
      </div>
    </>
  );
}

export default FindBox;

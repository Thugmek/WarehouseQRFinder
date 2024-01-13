import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';
import { useParams } from "react-router-dom";

function FindBox() {
  let { box_id } = useParams();

  const title = 'Find Box '+box_id;

  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/find/'+box_id, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
      .then(response => {
        setLoading(false)
        console.log("response", response.status)
        if(response.status == 404){
          setData()
        }else{
          setData(response.json())
        }
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
        <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
        {loading?
          <></>
          :
          <>{data?
            <img className='box-image' src={"data:image/jpg;base64,"+data.image} />
            :
            <>
            <Alert variant="danger"><h3>Box was not found</h3>Box probably is not present in monitored shelves. I recommend to check Peter's desk.</Alert>
            <img className='box-image-smaller' src="/NotFound.png" />
            </>
          }</>
        }
        </div>
      </div>
    </>
  );
}

export default FindBox;

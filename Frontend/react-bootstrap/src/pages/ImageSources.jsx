import { useState, useEffect, createRef } from 'react';
import { Helmet } from 'react-helmet';
import { Form, Button, InputGroup, InputGroupAppend } from 'react-bootstrap';
import { FiSave, FiPlus, FiTrash2, FiCrosshair } from "react-icons/fi";
import { backend_server } from '../common/constants';
import EditImageSourceWindow from '../components/EditImageSourceWindow';

function ImgageSources() {

  const title = 'Image Sources';

  const [modal, setModal] = useState()
  const [imageSources, setImageSources] = useState([]);

  function fetchSources(){
    fetch(backend_server+'/sources', {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
      .then(response => response.json())
      .then(data => {
        setImageSources(data.sources)
      })
      .catch((e) => console.error(e))
  }

  function deleteImageSource(source){
    fetch(backend_server+'/source/'+source.id, {
        method: "DELETE",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        }
    }).then(response => {
        console.log("Transfer Status: ", response.status)
        fetchSources()
    })
  }

  useEffect(() => {
    fetchSources()
  }, []);

  function hideModal(){
    setModal(null)
  }

  function editImageSource(source){
    setModal(<EditImageSourceWindow source={source} onClose={() => {
      fetchSources()
      hideModal()
    }}/>)
  }

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {modal?modal:<></>}
      <div className="container-fluid">
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h2">{title}</h1>
        </div>
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div>
            <button className="btn btn-primary btn-sm" onClick={(e) => editImageSource(null)}>New Image Source</button>
          </div>
        </div>
        {imageSources.map((source, i) => {
          return (
          <div key={source.id} className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div className="col p-4 d-flex flex-column position-static">
              <strong className="d-inline-block mb-2 text-muted">id: {source.id}</strong>
              <div className="d-grid d-md-block mt-4">
                <button className="btn btn-outline-secondary btn-sm" onClick={(e) => editImageSource(source)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={(e) => deleteImageSource(source)}>Delete</button>
              </div>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div className="pt-3 pe-3">
                {source.image?<img src={'data:image/png;base64, '+source.image} height={100}></img>:""}
              </div>
            </div>
          </div>)
        })}
      </div>
    </>
  );
}

export default ImgageSources;

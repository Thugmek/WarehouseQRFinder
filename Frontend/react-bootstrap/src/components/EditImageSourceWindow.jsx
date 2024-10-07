import { useState, useEffect, createRef } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form, InputGroup} from 'react-bootstrap';
import { FiSave, FiPlus, FiTrash2, FiCrosshair } from "react-icons/fi";
import { backend_server } from '../common/constants';
import {v4 as uuidv4} from 'uuid';

function EditImageSourceWindow({source, onClose}) {
    var isNewSource = false
    if(!source){
      source = {
        "id": uuidv4(),
        "type": "file",
        "config": {},
        "regions": []
      }
      isNewSource = true
    }

    const [debugImage, setDebugImage] = useState(null);
    const [regions, setRegions] = useState(source.regions.map((e) => {return {"rect": e, "highlighted": false}}));
    const [sourceConfig, setSourceConfig] = useState(JSON.stringify(source.config, null, 2));
    const [sourceType, setSourceType] = useState(source.type);

    const image = createRef()
    const canvas = createRef()

    useEffect(() => {
      fetch(backend_server+'/debug-img/'+source.id, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
          // 'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
        .then(response => response.json())
        .then(data => {
          setDebugImage(data)
        })
        .catch((e) => console.error(e))
    }, []);

    useEffect(() => {
      if(!debugImage){
        return
      }
      // Set canvas size equal to the image
      canvas.current.width = image.current.width;
      canvas.current.height = image.current.height;
  
      const widthCoef = image.current.width / debugImage.width
      const heightCoef = image.current.height / debugImage.height
  
      // Position the canvas over the image
      canvas.current.style.position = "absolute"
      canvas.current.style.left = image.current.offsetLeft + 'px';
      canvas.current.style.top = image.current.offsetTop + 'px';
  
      // Get the drawing context
      var ctx = canvas.current.getContext('2d');
  
      regions.forEach((e) => {
        ctx.beginPath();
        ctx.rect(e.rect[0]*widthCoef,e.rect[1]*heightCoef,e.rect[2]*widthCoef,e.rect[3]*heightCoef);
        if(e.highlighted){
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 3
        }else{
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 1
        }
        ctx.stroke();
      })
    }, [debugImage, regions]);

    function updateRegion(i,j,value){
      if(!regions[i].highlighted){
        regions.forEach((e) => {
          e.highlighted = false
        })
        regions[i].highlighted = true
      }
      regions[i].rect[j] = parseInt(value)
      setRegions([...regions])
    }
  
    function removeRegion(i){
      setRegions([...regions.slice(0,i),...regions.slice(i+1)])
    }
  
    function highlightRegion(i){
      regions.forEach((e) => {
        e.highlighted = false
      })
      regions[i].highlighted = true
      setRegions([...regions])
    }
  
    function addRegion(){
      regions.forEach((e) => {
        e.highlighted = false
      })
      setRegions([...regions,{"rect":[100,100,200,200], "highlighted": true}])
    }

    function testConfig(){
      fetch(backend_server+'/test-config', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body:JSON.stringify({
          "type": sourceType,
          "config": JSON.parse(sourceConfig)
        })
      })
        .then(response => response.json())
        .then(data => {
          setDebugImage(data)
        })
        .catch((e) => console.error(e))
    }

    function updateImageSource(){
      fetch(backend_server+'/source/'+source.id, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body:JSON.stringify({
            "type": sourceType,
            "config": JSON.parse(sourceConfig),
            "regions": regions.map(region => region.rect)
          })
      }).then(response => {
          console.log("Transfer Status: ", response.status)
      })
      onClose()
    }

    return (
        <Modal show={true} onHide={onClose} fullscreen={true}>
            <Modal.Header closeButton>
            <Modal.Title>{isNewSource?<>Create new Image Source</>:<>Edit Image Source</>}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
              {debugImage?<img src={'data:image/png;base64, '+debugImage.image} className='base-image' ref={image}></img>:""}
              <canvas className='base-image' ref={canvas}></canvas>
            </div>
            <InputGroup className="mb-3">
              <Button variant="outline-secondary" onClick={() => addRegion()}><FiPlus /> Add Region</Button>
            </InputGroup>
            {regions.map((region, i) => {
              return(
              <InputGroup key={i} className="mb-3">
              <Form.Control
                type="number"
                value={region.rect[0]}
                step={10}
                onChange={(e) => updateRegion(i,0,e.target.value)}
                onFocus={(e) => highlightRegion(i)}
                placeholder="X"
              />
              <Form.Control
                type="number"
                value={region.rect[1]}
                step={10}
                onChange={(e) => updateRegion(i,1,e.target.value)}
                onFocus={(e) => highlightRegion(i)}
                placeholder="Y"
              />
              <Form.Control
                type="number"
                value={region.rect[2]}
                step={10}
                onChange={(e) => updateRegion(i,2,e.target.value)}
                onFocus={(e) => highlightRegion(i)}
                placeholder="Width"
              />
              <Form.Control
                type="number"
                value={region.rect[3]}
                step={10}
                onChange={(e) => updateRegion(i,3,e.target.value)}
                onFocus={(e) => highlightRegion(i)}
                placeholder="Height"
              />
              <Button variant="outline-secondary" onClick={() => highlightRegion(i)}><FiCrosshair/> Highlight</Button>
              <Button variant="outline-secondary" onClick={() => removeRegion(i)}><FiTrash2/> Remove</Button>
            </InputGroup>)
            })}
            <InputGroup className="mb-3">
              <Form.Select value={sourceType} onChange={(e) => {setSourceType(e.target.value)}}>
                <option value="camera">Camera</option>
                <option value="file">File</option>
                <option value="url">URL</option>
                <option value="streamed">Streamed</option>
              </Form.Select>
              <Button variant="primary" onClick={(e) => testConfig()}>Test Config</Button>
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control type="text" as="textarea" placeholder="Image source config" rows={10} value={sourceConfig} onChange={(e) => setSourceConfig(e.target.value)}/>
            </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={(e) => onClose()}>
                  Cancel
                </Button>
                {isNewSource?
                <Button variant="primary" onClick={(e) => {updateImageSource()}}>
                  Create
                </Button>:
                <Button variant="primary" onClick={(e) => {updateImageSource()}}>
                  Update
                </Button>}
            </Modal.Footer>
        </Modal>
    );
  }
  
  export default EditImageSourceWindow;
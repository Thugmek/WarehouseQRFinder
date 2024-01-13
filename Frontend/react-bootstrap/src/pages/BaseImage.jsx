import { useState, useEffect, createRef } from 'react';
import { Helmet } from 'react-helmet';
import { Form, Button, InputGroup, InputGroupAppend } from 'react-bootstrap';
import { FiSave, FiPlus, FiTrash2, FiCrosshair } from "react-icons/fi";

function BaseImage() {

  const title = 'Base Image';

  const [data, setData] = useState();
  const [regions, setRegions] = useState([
    {"rect":[100,100,200,200], "highlighted": false},
    {"rect":[150,200,200,200], "highlighted": false}
  ]);
  const image = createRef()
  const canvas = createRef()

  useEffect(() => {
    fetch('http://localhost:5000/base-img', {
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
      .catch((e) => console.log(e))
    fetch('http://localhost:5000/regions', {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log("regions", data)
        setRegions(data.regions.map(region => {return{"rect":region, "highlighted":false}}))
      })
      .catch((e) => console.log(e))
  }, []);

  useEffect(() => {
    if(!data){
      return
    }
    // Set canvas size equal to the image
    canvas.current.width = image.current.width;
    canvas.current.height = image.current.height;

    const widthCoef = image.current.width / data.width
    const heightCoef = image.current.height / data.height

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
  }, [data, regions]);

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

  function saveRegions(){
    console.log("Save regions")
    fetch('http://localhost:5000/regions', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:JSON.stringify({
        "regions": regions.map(region => region.rect)
      })
    })
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
        {data && 
          <div className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <img className='base-image' src={"data:image/jpg;base64,"+data.image} ref={image}/>
            <canvas className='base-image' ref={canvas}></canvas>
          </div>
        }
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h5">Scan regions</h1>
        </div>
        <InputGroup className="mb-3">
          <Button variant="outline-secondary" onClick={() => addRegion()}><FiPlus /> Add</Button>
          <Button variant="outline-secondary" onClick={() => saveRegions()}><FiSave /> Save</Button>
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
      </div>
    </>
  );
}

export default BaseImage;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Form, Button, InputGroup} from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';
import { FiSave, FiPlus, FiTrash2, FiCrosshair } from "react-icons/fi";

function LabelsGenerator() {
  const title = 'Labels Generator';

  const [labels, setLabels] = useState([]);
  const [variant, setVariant] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const lbls = localStorage.getItem('labels');
    if(lbls){
      setLabels(JSON.parse(lbls))
    }else{
      localStorage.setItem('labels', JSON.stringify([]))
    }
    const vr = localStorage.getItem('labels-size');
    if(vr){
      setVariant(vr)
    }else{
      localStorage.setItem('labels-size', "Filament Box")
      setVariant("Filament Box")
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('labels', JSON.stringify(labels))
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, [labels]);

  function updateLabel(i, value){
    labels[i].label = value
    setLabels([...labels])
  }

  function updateLabel2(i, value){
    labels[i].label2 = value
    setLabels([...labels])
  }

  function updateLabelId(i, value){
    labels[i].id = value
    setLabels([...labels])
  }

  function removeLabel(i){
    setLabels([...labels.slice(0,i),...labels.slice(i+1)])
  }

  function addLabel(){
    setLabels([...labels,{"label":"", "label2":"", "id": ""}])
  }

  function clearLabels(){
    setLabels([])
  }

  function proceedGenerator(){
    localStorage.setItem('labels', JSON.stringify(labels))
    window.open("/labels-printout", '_blank')
  }

  function changeVariant(variant){
    setVariant(variant)
    localStorage.setItem('labels-size', variant)
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
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic">
              {variant}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={(e) => {changeVariant("Filament Box")}}>Filament Box</Dropdown.Item>
              <Dropdown.Item onClick={(e) => {changeVariant("Titan Box")}}>Titan Box</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        {labels.map((label, i) => {
          return(
          <InputGroup key={i} className="mb-3">
          <Form.Control
            type="text"
            placeholder="Label"
            value={label.label}
            onChange={(e) => updateLabel(i,e.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="Label - second row"
            value={label.label2}
            onChange={(e) => updateLabel2(i,e.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="ID (keep empty for random)"
            value={label.id}
            onChange={(e) => updateLabelId(i,e.target.value)}
          />
          <Button variant="outline-secondary" onClick={() => removeLabel(i)}><FiTrash2/> Remove</Button>
        </InputGroup>)
        })}
        <div className="text-center border-bottom">
          <Button className="btn btn-primary mb-3" onClick={(e)=>{addLabel()}}>Add Label</Button>
          <Button className="btn btn-primary mb-3" onClick={(e)=>{clearLabels()}}>Clear Labels</Button>
          <Button className="btn btn-primary mb-3" disabled={labels.length==0} onClick={(e)=>{proceedGenerator()}}>Generate Labels</Button>
        </div>
      </div>
    </>
  );
}

export default LabelsGenerator;

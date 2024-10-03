import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import QrReader from 'react-qr-scanner'
import { Form, InputGroup} from 'react-bootstrap';
import { backend_server } from '../common/constants';
import useSound from 'use-sound';

function SetBoxWindow({goods, onClose}) {
    const [boxId, setBoxId] = useState("");
    const [playSound] = useSound('/beep.mp3');

    function handleScan(data){
        if (data){
            if (data.text !== boxId){
                playSound()
            }
            setBoxId(data.text)
        }
    }

    function setBox(){
        fetch(backend_server+'/update_stock_item', {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body:JSON.stringify({
              "id": goods.id,
              "updatedFields": {
                "position": boxId
              }
            })
        }).then(response => {
            console.log("Transfer Status: ", response.status)
        })
        onClose()
    }

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
            <Modal.Title>Set Box</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <p>{goods.name}</p>
            <QrReader
                style={{width: "100%" }}
                delay={100}
                onError={console.error}
                onScan={handleScan}
            />
            <InputGroup className="mb-3">
              <Form.Control type="text" placeholder="Box ID" value={boxId} onChange={(e) => setBoxId(e.target.value)}/>
            </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={(e) => onClose()}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={boxId==""} onClick={(e) => {setBox()}}>
                    Set
                </Button>
            </Modal.Footer>
        </Modal>
    );
  }
  
  export default SetBoxWindow;
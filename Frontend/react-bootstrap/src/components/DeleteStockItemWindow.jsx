import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import QrReader from 'react-qr-scanner'
import { Form, InputGroup} from 'react-bootstrap';
import { backend_server } from '../common/constants';
import useSound from 'use-sound';

function DeleteStockItemWindow({item, onClose}) {
    const [boxId, setBoxId] = useState("");


    function deleteStockItem(){
        fetch(backend_server+'/remove_stock_item', {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body:JSON.stringify({
              "id": item.id,
            })
        }).then(response => {
            console.log("Transfer Status: ", response.status)
        })
        onClose()
    }

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
            <Modal.Title>Confirm delete {item.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <p>{item.name}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={(e) => onClose()}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={(e) => {deleteStockItem()}}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
  }
  
  export default DeleteStockItemWindow;
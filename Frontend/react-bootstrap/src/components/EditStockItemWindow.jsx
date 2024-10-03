import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import QrReader from 'react-qr-scanner'
import { Form, InputGroup} from 'react-bootstrap';
import { backend_server } from '../common/constants';
import useSound from 'use-sound';

function EditStockItemWindow({item, onClose}) {
    var isNewItem = false
    if(!item){
      item = {
        "name":"",
        "description": "",
        "image": null
      }
      isNewItem = true
    }
    const [itemName, setItemName] = useState(item.name);
    const [itemDescription, setItemDescription] = useState(item.description);
    const [itemImageFile, setItemImageFile] = useState(null);
    const [itemImage, setItemImage] = useState(item.image);

    useEffect(() => {
      if (!itemImageFile) {
        return;
      }
      console.log(itemImageFile)
      var reader = new FileReader();
      reader.onload = function(e) {
        var contents = e.target.result.replace("data:", "").replace(/^.+,/, "")
        console.log(contents);
        setItemImage(contents)
      };
      reader.readAsDataURL(itemImageFile);
    }, [itemImageFile]);

    function editStockItem(){
        var updatedFields = {}
        if(itemName !== item.name) updatedFields.name = itemName
        if(itemDescription !== item.description) updatedFields.description = itemDescription
        if(itemImage !== item.iamge) updatedFields.image = itemImage
        fetch(backend_server+'/update_stock_item', {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json"
            },
            body:JSON.stringify({
              "id": item.id,
              "updatedFields": updatedFields
            })
        }).then(response => {
            console.log("Transfer Status: ", response.status)
        })
        onClose()
    }

    function createStockItem(){
      fetch(backend_server+'/create_stock_item', {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body:JSON.stringify({
            "name": itemName,
            "description": itemDescription,
            "image": itemImage
          })
      }).then(response => {
          console.log("Transfer Status: ", response.status)
      })
      onClose()
    }

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
            <Modal.Title>{isNewItem?<>Create new item</>:<>Edit item {item.name}</>}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <InputGroup className="mb-3">
              <Form.Control type="text" placeholder="Name" value={itemName} onChange={(e) => setItemName(e.target.value)}/>
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control type="text" as="textarea" placeholder="Description" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}/>
            </InputGroup>
            {itemImage?<img src={'data:image/png;base64, '+itemImage} height={100}></img>:""}
            <InputGroup className="mb-3">
              <Form.Control type="file" placeholder="Image" onChange={(e) => setItemImageFile(e.target.files[0])}/>
            </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={(e) => onClose()}>
                  Cancel
                </Button>
                {isNewItem?
                <Button variant="primary" onClick={(e) => {createStockItem()}}>
                  Create
                </Button>:
                <Button variant="primary" onClick={(e) => {editStockItem()}}>
                  Update
                </Button>}
            </Modal.Footer>
        </Modal>
    );
  }
  
  export default EditStockItemWindow;
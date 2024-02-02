import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import { backend_server } from '../common/constants';

function FindBoxWindow({boxId, onClose}) {
    const [data, setData] = useState();
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(backend_server+'/find/'+boxId, {
        method: "GET",
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
        })
        .then(response => {
            console.log("response", response.status)
            if(response.status == 404){
            setNotFound(true)
            setData("")
            }else{
            response.json().then((body) => {
                console.log(body)
                setData(body)
            })
            }
        })
    }, []);
    return (
        <Modal show={true} className="wide-modal" onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Box {boxId}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {notFound?
                <>
                    <Alert variant="danger"><h3>Box was not found</h3>Box probably is not present in monitored shelves. I recommend to check Peter's desk.</Alert>
                    <img style={{width: "60%", margin: "auto", display: "block" }} src="/NotFound.png" />
                </>
                :
                <>{data?<img style={{width: "100%" }} src={"data:image/jpg;base64,"+data.image} />
                :
                <Alert variant="secondary">Searching for box {boxId}</Alert>
                }</>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={(e) => onClose()}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
  }
  
  export default FindBoxWindow;
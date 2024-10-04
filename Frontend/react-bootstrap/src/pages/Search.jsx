import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Form, Button, InputGroup} from 'react-bootstrap';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';
import { backend_server } from '../common/constants';
import SetBoxWindow from '../components/SetBoxWindow';
import FindBoxWindow from '../components/FindBoxWindow';
import DeleteStockItemWindow from '../components/DeleteStockItemWindow'
import EditStockItemWindow from '../components/EditStockItemWindow';

function Search() {
  const title = 'Search';

  const { getSession } = useAuth();
  const user = getSession();
  const [modal, setModal] = useState()
  const [searchValue, setSearchValue] = useState('')
  const [searchInBoxes, setSearchInBoxes] = useState(true)
  const [searchNotInBoxes, setSearchNotInBoxes] = useState(false)
  const [items, setItems] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [nextOffset, setNextOffset] = useState(0);
  const navigate = useNavigate();

  function do_search(value, offset) {
    if(!(searchInBoxes||searchNotInBoxes)){
      setItems([])
      return
    }
    fetch(backend_server+'/search_stock', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:JSON.stringify({
        "search_string": value,
        "search_in_boxes": searchInBoxes,
        "search_not_inBoxes": searchNotInBoxes
      })
    })
      .then(response => response.json())
      .then(data => {
        length = 0
        if(data['rows']){
          length = data['rows'].length
        }else{
          data['rows'] = []
        }
        setNextOffset(offset+length)
        if(offset>0){
          setItems([...items,...data['rows']])
          setNextOffset(nextOffset+length)
        }else{
          setItems(data['rows'])
        }
        //setShowMore(!data.hasOwnProperty('totalCount'))
        setShowMore(false)
      })
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      do_search(searchValue,0);
    }, 600);
    return () => {
      clearTimeout(timeout);
    };
  }, [searchValue, searchInBoxes, searchNotInBoxes]);

  function loadMore(){
    do_search(searchValue,nextOffset);
  }

  function hideModal(){
    setModal(null)
  }

  function showBox(boxId){
    setModal(<FindBoxWindow boxId={boxId} onClose={hideModal}/>)
  }

  function setBox(goods){
    setModal(<SetBoxWindow goods={goods} onClose={hideModal}/>)
  }

  function deleteStockItem(item){
    setModal(<DeleteStockItemWindow item={item} onClose={() => {
      do_search(searchValue,0)
      hideModal()
    }}/>)
  }

  function editStockItem(item){
    setModal(<EditStockItemWindow item={item} onClose={() => {
      do_search(searchValue,0)
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
            <InputGroup className="mb-3">
              <Form.Control type="text" placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}/>
              <button className="btn btn-primary btn-sm" onClick={(e) => do_search(searchValue,0)}>Refresh</button>
            </InputGroup>
          </div>
          <div>
          <InputGroup>
            <Form.Check inline label="In Boxes" checked={searchInBoxes} onChange={(e) => setSearchInBoxes(e.target.checked)}/>
            <Form.Check inline label="NOT In Boxes" checked={searchNotInBoxes} onChange={(e) => setSearchNotInBoxes(e.target.checked)}/>
          </InputGroup>
          </div>
          <div>
            <button className="btn btn-primary btn-sm" onClick={(e) => editStockItem(null)}>New Item</button>
          </div>
        </div>
        {items.map((item, i) => {
          return (
          <div key={i} className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div className="col p-4 d-flex flex-column position-static">
              <strong className="d-inline-block mb-2 text-muted">id: {item.id}</strong>
              <strong  className="mb-0 fs-5" >{item.name}</strong>
              <div className="d-grid d-md-block mt-4">
                <button className="btn btn-outline-secondary btn-sm" disabled={!item.position} onClick={(e) => showBox(item.position)} >Show</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={(e) => setBox(item)}>Set Box</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={(e) => editStockItem(item)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={(e) => deleteStockItem(item)}>Delete</button>
              </div>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div className="pt-3 pe-3">
                {item.image?<img src={'data:image/png;base64, '+item.image} height={100}></img>:""}
              </div>
            </div>
          </div>)
        })}
        <div className="text-center border-bottom">
          <Button className="btn btn-primary mb-3" hidden={!showMore} onClick={(e)=>{loadMore()}}>Load more</Button>
        </div>
      </div>
    </>
  );
}

export default Search;

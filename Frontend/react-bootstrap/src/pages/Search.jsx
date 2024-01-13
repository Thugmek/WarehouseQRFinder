import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Form, Button, InputGroup} from 'react-bootstrap';
import Jdenticon from '../components/Jdenticon';
import useAuth from '../hooks/useAuth';

function Search() {
  const title = 'Search';

  const { getSession } = useAuth();
  const user = getSession();
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
    const filter = {"goods.name": {
        "operator": "FULL_TEXT",
        "value": value,
        "noValueOperator": false
      },
      "stock": {
        "operator": "IN",
        "value": [
          {
            "id": 9,
            "referenceName": "Vývoj sklad"
          }
        ],
        "noValueOperator": false
      }
    }
    if(!(searchInBoxes&&searchNotInBoxes)){
      if(searchInBoxes){
        filter["position"] = {
          "operator": "NOT_EMPTY",
          "noValueOperator": true
        }
      }else{
        filter["position"] = {
          "operator": "EMPTY",
          "noValueOperator": true
        }
      }
    }
    fetch('http://localhost:5000/search_stock', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:JSON.stringify({
        "filterByColumn": filter,
        "offset": offset
      })
    })
      .then(response => response.json())
      .then(data => {
        setNextOffset(offset+data['rows'].length)
        if(offset>0){
          setItems([...items,...data['rows']])
          setNextOffset(nextOffset+data['rows'].length)
        }else{
          setItems(data['rows'])
        }
        setShowMore(!data.hasOwnProperty('totalCount'))
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
        <div
          className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <div>
            <InputGroup className="mb-3">
              <Form.Control type="text" placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)}/>
            </InputGroup>
          </div>
          <div>
          <InputGroup>
            <Form.Check inline label="In Boxes" checked={searchInBoxes} onChange={(e) => setSearchInBoxes(e.target.checked)}/>
            <Form.Check inline label="NOT In Boxes" checked={searchNotInBoxes} onChange={(e) => setSearchNotInBoxes(e.target.checked)}/>
          </InputGroup>
          </div>
        </div>
        {items.map((item, i) => {
          return (
          <div key={i} className="row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative">
            <div className="col p-4 d-flex flex-column position-static">
              <strong className="d-inline-block mb-2 text-muted">id: {item.goods.id}</strong>
              <strong  className="mb-0 fs-5" >{item.goods.name}</strong>
              <p className="card-text mb-auto text-muted">{item.quantity} {item.goods.unit}</p>
              <div className="d-grid d-md-block mt-4">
                <button className="btn btn-outline-secondary btn-sm" disabled={!item.position} onClick={(e) => navigate("find_box/"+item.position)} >Show</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={(e) => window.open("find_box/abcDeF1", '_blank')} >Write-off</button>
                <button className="btn btn-outline-secondary btn-sm">Set Box</button>
              </div>
            </div>
            <div className="col-auto d-none d-lg-block">
              <div className="pt-3 pe-3">
                {item.goods.photoUrl?<a href={'https://trilab.factorify.cloud/'+item.goods.photoUrl}><img src={'https://trilab.factorify.cloud/'+item.goods.photoUrl} height={100}></img></a>:""}
              </div>
            </div>
          </div>)
        })}
        <div class="text-center border-bottom">
          <Button class="btn btn-primary mb-3" hidden={!showMore} onClick={(e)=>{loadMore()}}>Load more</Button>
        </div>
      </div>
    </>
  );
}

export default Search;

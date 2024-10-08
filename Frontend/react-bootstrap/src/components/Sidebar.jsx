import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BiSearchAlt, BiLayer } from 'react-icons/bi';
import { FiSettings, FiSearch, FiLayers, FiUser, FiImage, FiPenTool } from 'react-icons/fi';
import { Form, InputGroup} from 'react-bootstrap';

import './sidebar.css';

function Sidebar() {
  const items = [
    { path: '/', title: 'Search', icon: <FiSearch/>, is_admin: false },
    { path: '/labels-generator', title: 'Labels Generator', icon: <FiPenTool/>, is_admin: false },
    { separator: true, is_admin: true},
    { path: '/image-sources', title: 'Image Sources', icon: <FiImage/>, is_admin: true },
    //{ path: '/labels-generator', title: 'Labels Generator', icon: <FiPenTool/> },
  ];

  const [adminView, setAdminView] = useState(false);

  return (
    <>
      <div className="position-sticky pt-3" style={{"minHeight": "100%"}}>
        <ul className="nav flex-column">
          {
            items.map((item, i) => (
              (item.is_admin && !adminView)?"":
              ((item.separator)?
              <hr key={i} />
              :
              <li key={i} className="nav-item">
                <NavLink className="nav-link" end to={item.path}>
                  <h5>{item.icon} {item.title}</h5>
                </NavLink>
              </li>)
            ))
          }
        </ul>
        <div className="position-absolute top-100 start-0">
        <Form style={{"transform": "translate(20px, -30px)"}}>
          <Form.Check // prettier-ignore
            type="switch"
            value={adminView}
            label="extra config"
            onChange={(e) => setAdminView(e.target.checked)}
          />
        </Form>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

import { NavLink } from 'react-router-dom';
import { BiSearchAlt, BiLayer } from 'react-icons/bi';
import { FiSettings, FiSearch, FiLayers, FiUser, FiImage } from 'react-icons/fi';

import './sidebar.css';

function Sidebar() {
  const items = [
    { path: '/', title: 'Search', icon: <FiSearch/> },
    { path: '/base_image', title: 'Base Image', icon: <FiImage/> },
  ];

  return (
    <>
      <div className="position-sticky pt-3">
        <ul className="nav flex-column">
          {
            items.map((item, i) => (
              <li key={i} className="nav-item">
                <NavLink className="nav-link" end to={item.path}>
                  <h5>{item.icon} {item.title}</h5>
                </NavLink>
              </li>
            ))
          }
        </ul>
      </div>
    </>
  );
}

export default Sidebar;

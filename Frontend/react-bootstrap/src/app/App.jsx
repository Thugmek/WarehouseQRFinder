import {
  BrowserRouter, Navigate, Routes, Route,
} from 'react-router-dom';

import ConsoleLayout from '../layouts/ConsoleLayout';
import NotFound from '../pages/NotFound';
import Search from '../pages/Search';
import FindBox from '../pages/FindBox';
import BaseImage from '../pages/BaseImage';
import AuthProvider from '../hooks/AuthProvider';

import './customStyles.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ConsoleLayout />}>
            <Route path="" element={<Search />} />
            <Route path="find_box/:box_id" element={<FindBox />} />
            <Route path="base_image" element={<BaseImage />} />
            <Route path="not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
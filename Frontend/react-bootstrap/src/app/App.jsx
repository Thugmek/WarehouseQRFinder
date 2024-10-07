import {
  BrowserRouter, Navigate, Routes, Route,
} from 'react-router-dom';

import ConsoleLayout from '../layouts/ConsoleLayout';
import NotFound from '../pages/NotFound';
import Search from '../pages/Search';
import BaseImage from '../pages/BaseImage';
import AuthProvider from '../hooks/AuthProvider';
import LabelsGenerator from '../pages/LabelsGenerator';
import LabelsPrintout from '../pages/LabelsPrintout';
import ImgageSources from '../pages/ImageSources';

import './customStyles.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ConsoleLayout />}>
            <Route path="" element={<Search />} />
            <Route path="base_image" element={<BaseImage />} />
            <Route path="labels-generator" element={<LabelsGenerator />} />
            <Route path="image-sources" element={<ImgageSources />} />
            <Route path="not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
          </Route>
          <Route path="/labels-printout" element={<LabelsPrintout />}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

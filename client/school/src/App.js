import { Route, Routes } from 'react-router-dom';
import School from './pages/School';
import Home from './pages/Home';
import Home2 from './pages/Home2';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/" element={<Home2 />} /> */}
      <Route path="/school" element={<School />} />
    </Routes>
  );
};

export default App;

import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails'; // <-- Import this

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        
        {/* <-- Add the new Project Details Route --> */}
        <Route path="/project/:projectId" element={user ? <ProjectDetails /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
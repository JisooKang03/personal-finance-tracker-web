import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<div>Register page coming soon</div>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>Dashboard coming soon</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
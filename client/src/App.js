import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Nav, Container, Alert } from 'react-bootstrap';

import LoginPage from './LoginPage';
import TicketsPage from './TicketsPage';
import LogsPage from './LogsPage';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [error, setError] = useState('');

  const apiClient = axios.create({
    baseURL: API_URL,
  });

  apiClient.interceptors.request.use(config => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  // Funkcja do obsługi logowania
  const handleLogin = async (email, password) => {
    try {
      setError('');
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('authToken', newToken);
    } catch (err) {
      console.error('Błąd logowania:', err);
      setError(err.response?.data?.error || 'Błąd logowania');
    }
  };

  // Funkcja do obsługi rejestracji
  const handleRegister = async (email, password) => {
     try {
       setError('');
       await axios.post(`${API_URL}/auth/register`, { email, password });
       return true;
     } catch (err) {
       console.error('Błąd rejestracji:', err);
       setError(err.response?.data?.error || 'Błąd rejestracji');
       return false;
     }
  };

  // Funkcja wylogowania
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
  };

  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">System</Navbar.Brand>
          <Nav className="me-auto">
            {token && (
              <>
                <Nav.Link as={Link} to="/tickets">Moje Zgłoszenia</Nav.Link>
                <Nav.Link as={Link} to="/logs">Logi Systemu</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {token ? (
              <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>Wyloguj</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login">Logowanie</Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container>
        {error && !token && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <Routes>
          <Route 
            path="/login" 
            element={
              token ? <Navigate to="/tickets" /> : <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
            } 
          />
          
          <Route 
            path="/tickets" 
            element={
              token ? <TicketsPage apiClient={apiClient} /> : <Navigate to="/login" />
            } 
          />
          <Route 
            path="/logs" 
            element={
              token ? <LogsPage apiClient={apiClient} /> : <Navigate to="/login" />
            } 
          />

          <Route 
            path="/" 
            element={
              token ? <Navigate to="/tickets" /> : <Navigate to="/login" />
            } 
          />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;
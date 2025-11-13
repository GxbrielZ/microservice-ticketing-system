import React, { useState } from 'react';
import { Form, Button, Card, Tabs, Tab } from 'react-bootstrap';

function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  
  const [message, setMessage] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    onLogin(email, password);
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setRegError('');

    if (regPassword !== regPasswordConfirm) {
      setRegError('Hasła nie są zgodne!');
      return;
    }
    
    const success = await onRegister(regEmail, regPassword);
    
    if (success) {
      setMessage('Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.');
      setRegEmail('');
      setRegPassword('');
      setRegPasswordConfirm('');
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <Card style={{ width: '25rem' }}>
        <Card.Body>
          {message && <div className="alert alert-success">{message}</div>}
          
          <Tabs defaultActiveKey="login" id="auth-tabs" className="mb-3" fill>
            <Tab eventKey="login" title="Logowanie">
              <Form onSubmit={handleLoginSubmit}>
                <Form.Group className="mb-3" controlId="formLoginEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Wpisz email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formLoginPassword">
                  <Form.Label>Hasło</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button variant="primary" type="submit">
                    Zaloguj
                  </Button>
                </div>
              </Form>
            </Tab>
            
            <Tab eventKey="register" title="Rejestracja">
              <Form onSubmit={handleRegisterSubmit}>
                <Form.Group className="mb-3" controlId="formRegisterEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Wpisz email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formRegisterPassword">
                  <Form.Label>Hasło</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Hasło"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                 <Form.Group className="mb-3" controlId="formRegisterPasswordConfirm">
                  <Form.Label>Potwierdź Hasło</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Potwierdź hasło"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    required
                  />
                  {regError && <Form.Text className="text-danger">{regError}</Form.Text>}
                </Form.Group>

                <div className="d-grid">
                  <Button variant="success" type="submit">
                    Zarejestruj
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
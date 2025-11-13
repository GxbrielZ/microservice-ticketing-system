import React, { useState, useEffect } from 'react';
import { Form, Button, Card, ListGroup, Alert, Row, Col } from 'react-bootstrap';

function TicketsPage({ apiClient }) {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Stany dla nowego zgłoszenia
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Stany dla edycji
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Nowe');

  // Funkcja do pobierania zgłoszeń
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      console.error('Błąd pobierania zgłoszeń:', err);
      setError(err.response?.data?.error || 'Nie udało się pobrać zgłoszeń');
    } finally {
      setLoading(false);
    }
  };

  // Pobierz zgłoszenia przy pierwszym renderowaniu komponentu
  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CREATE
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const response = await apiClient.post('/tickets', {
        title: newTitle,
        description: newDesc,
      });
      // Dodaj nowe zgłoszenie do listy (na początek)
      setTickets([response.data, ...tickets]);
      // Wyczyść formularz
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error('Błąd tworzenia zgłoszenia:', err);
      setError('Nie udało się utworzyć zgłoszenia');
    }
  };
  
  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
        return;
    }
    try {
        await apiClient.delete(`/tickets/${id}`);
        // Odfiltruj usunięte zgłoszenie ze stanu
        setTickets(tickets.filter(ticket => ticket.id !== id));
    } catch (err) {
        console.error('Błąd usuwania zgłoszenia:', err);
        setError('Nie udało się usunąć zgłoszenia');
    }
  };
  
  // UPDATE - Ustawia tryb edycji
  const startEdit = (ticket) => {
      setEditingId(ticket.id);
      setEditTitle(ticket.title);
      setEditDesc(ticket.description);
      setEditStatus(ticket.status);
  };

  // UPDATE - Anuluje tryb edycji
  const cancelEdit = () => {
      setEditingId(null);
      setEditTitle('');
      setEditDesc('');
      setEditStatus('Nowe');
  };
  
  // UPDATE - Zapisuje zmiany
  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
          const response = await apiClient.put(`/tickets/${editingId}`, {
              title: editTitle,
              description: editDesc,
              status: editStatus
          });
          
          // Zaktualizuj stan
          setTickets(tickets.map(t => t.id === editingId ? response.data : t));
          
          // Zakończ edycję
          cancelEdit();
      } catch (err) {
          console.error('Błąd aktualizacji zgłoszenia:', err);
          setError('Nie udało się zaktualizować zgłoszenia');
      }
  };


  if (loading) return <p>Ładowanie zgłoszeń...</p>;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>Dodaj nowe zgłoszenie</Card.Header>
        <Card.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-2">
              <Form.Label>Tytuł</Form.Label>
              <Form.Control
                type="text"
                placeholder="Co jest problemem?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Opis (opcjonalnie)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">Dodaj</Button>
          </Form>
        </Card.Body>
      </Card>
      
      <h3>Moje zgłoszenia</h3>

      <ListGroup>
        {tickets.length === 0 && <ListGroup.Item>Nie masz jeszcze żadnych zgłoszeń.</ListGroup.Item>}

        {tickets.map(ticket => (
            <ListGroup.Item key={ticket.id} className="mb-2 shadow-sm">
                {editingId === ticket.id ? (
                    <Form onSubmit={handleUpdate}>
                        <Form.Group className="mb-2">
                            <Form.Label>Tytuł</Form.Label>
                            <Form.Control type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Opis</Form.Label>
                            <Form.Control as="textarea" rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Status</Form.Label>
                            <Form.Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                <option value="Nowe">Nowe</option>
                                <option value="W trakcie">W trakcie</option>
                                <option value="Zakończone">Zakończone</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="success" type="submit" size="sm" className="me-2">Zapisz</Button>
                        <Button variant="secondary" size="sm" onClick={cancelEdit}>Anuluj</Button>
                    </Form>
                ) : (
                    <Row>
                        <Col md={8}>
                            <h5>{ticket.title} <span className="badge bg-info ms-2">{ticket.status}</span></h5>
                            <p>{ticket.description}</p>
                            <small className="text-muted">Utworzono: {new Date(ticket.created_at).toLocaleString()}</small>
                        </Col>
                        <Col md={4} className="text-md-end align-self-center">
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => startEdit(ticket)}>Edytuj</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(ticket.id)}>Usuń</Button>
                        </Col>
                    </Row>
                )}
            </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

export default TicketsPage;
import React, { useState, useEffect } from 'react';
import { Table, Alert, Badge } from 'react-bootstrap';

const getBadgeVariant = (level) => {
    switch (level) {
        case 'error': return 'danger';
        case 'warn': return 'warning';
        case 'info': return 'info';
        default: return 'secondary';
    }
};

function LogsPage({ apiClient }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiClient.get('/logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Błąd pobierania logów:', err);
        setError(err.response?.data?.error || 'Nie udało się pobrać logów');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p>Ładowanie logów...</p>;

  return (
    <>
      <h2>Logi Systemowe</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Serwis</th>
            <th>Poziom</th>
            <th>Wiadomość</th>
            <th>Kontekst (JSON)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.service}</td>
              <td>
                <Badge bg={getBadgeVariant(log.level)}>{log.level.toUpperCase()}</Badge>
              </td>
              <td>{log.message}</td>
              <td>
                <pre style={{ fontSize: '0.8em', margin: 0, backgroundColor: '#f4f4f4', padding: '5px' }}>
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {logs.length === 0 && !loading && <p>Brak logów do wyświetlenia.</p>}
    </>
  );
}

export default LogsPage;
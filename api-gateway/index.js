require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware Weryfikacji JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Odmowa dostępu. Brak tokena.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.warn('Błędny token:', err.message);
    return res.status(403).json({ error: 'Nieważny token.' });
  }
};

// Konfiguracja Proxy
const crudServiceProxy = proxy(process.env.CRUD_SERVICE_URL, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
      proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
    }
    return proxyReqOpts;
  },
  proxyReqPathResolver: (req) => {
    return `/tickets${req.url}`;
  }
});

// Trasy autoryzacji (publiczne)
app.post('/api/auth/register', proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return '/register';
    }
}));

app.post('/api/auth/login', proxy(process.env.AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return '/login';
    }
}));

// Trasy CRUD (chronione)
app.use('/api/tickets', verifyToken, crudServiceProxy);

// Trasy Logów (chronione)
app.get('/api/logs', verifyToken, proxy(process.env.LOG_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return '/logs';
    }
}));

// Uruchomienie Serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[API Gateway] Uruchomiona na porcie ${PORT}`);
  console.log(`-> Auth Service: ${process.env.AUTH_SERVICE_URL}`);
  console.log(`-> CRUD Service: ${process.env.CRUD_SERVICE_URL}`);
  console.log(`-> Log Service: ${process.env.LOG_SERVICE_URL}`);
});
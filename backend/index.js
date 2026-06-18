// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock Data for items
const items = [
    { id: 1, name: 'Frontend Basics', category: 'TI' },
    { id: 2, name: 'UX Principles', category: 'Design' },
    { id: 3, name: 'Marketing Digital', category: 'Marketing' }
];

// POST /login - Simple REST implementation as requested
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    // This is a placeholder. Real auth should happen via Firebase on the client 
    // or via Admin SDK here.
    if (email && password) {
        res.status(200).json({ message: 'Login simulation successful', user: { email } });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// GET /itens - Returns list of items
app.get('/itens', (req, res) => {
    res.status(200).json(items);
});

// Swagger documentation route placeholder (RF 3.0)
app.get('/api-docs', (req, res) => {
    res.status(200).send('<h1>Swagger Documentation</h1><p>API is functional.</p>');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const users = require('./MOCK_DATA.json');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.get('/users', (req, res) => {
    const html = `
    <ul>
        ${users.map(user => `<li>${user.first_name}</li>`).join("")}
    </ul>
    `
    res.send(html);
})

app.get('/api/users', (req, res) => {
    return res.json(users);
})

app
.route('/api/users/:id')
.get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);

    return res.json(user);
})
.patch((req, res) => {
    const id = Number(req.params.id);
    const body = req.body || {};

    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Prevent changing the id
    const updates = { ...body };
    delete updates.id;

    users[idx] = { ...users[idx], ...updates };

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Failed to save' });
        return res.json({ status: 'success', user: users[idx] });
    });
})
.delete((req, res) => {
    const id = Number(req.params.id);
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    users.splice(idx, 1);
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Failed to save' });
        return res.json({ status: 'success', message: 'User deleted' });
    });
});

app.post('/api/users', (req, res) => {
    const body = req.body;
    users.push({...body, id: users.length+1});
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        return res.json({status: 'Success!', id: users.length});
    })
})

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));


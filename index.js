const express = require('express');
const users = require('./MOCK_DATA.json');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware - Plugin
app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
app.use((req, res, next) => {
    // console.log('Hello from Middleware 1');
    // req.myUserName = 'John Doe';
    fs.appendFile('log.txt', `${Date.now()}: ${req.ip}: ${req.method}: ${req.path}\n`, (err, data) => {
        next();
    })
})

// app.use((req, res, next) => {
//     // console.log('Hello from Middleware 2', req.myUserName);
//     next();
// })

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
    // console.log('I am in get route', req.myUserName);
    res.setHeader('X-myName', 'Syed Areeb');  // Custom Headers should start with X- to avoid conflicts with standard headers
    console.log(req.headers);
    return res.json(users);
})

app
.route('/api/users/:id')
.get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

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
    if (!body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    users.push({...body, id: users.length+1});
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        return res.status(201).json({status: 'Success!', id: users.length});
    })
})

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));


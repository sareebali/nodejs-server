const express = require('express');
// const users = require('./MOCK_DATA.json');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();
const PORT = 8000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/users-app-1')
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.log('Mongo error:', err));

// Schema
const userSchema = new mongoose.Schema({
        first_name: { 
            type: String, 
            required: true 
        },
        last_name: { 
            type: String
        },
        email: { 
            type: String, 
            required: true,
            unique: true 
        },
        jobTitle: {
            type: String
        },
        gender: {
            type: String
        }
    }, 
    {timestamps: true}
);

const User = mongoose.model('user', userSchema);

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
app.get('/users', async (req, res) => {
    const allDbUsers = await User.find({});
    const html = `
    <ul>
        ${allDbUsers.map(user => `<li>${user.first_name} - ${user.email}</li>`).join("")}
    </ul>
    `
    res.send(html);
})

app.get('/api/users', async (req, res) => {
    const allDbUsers = await User.find({});
    // console.log('I am in get route', req.myUserName);
    // res.setHeader('X-myName', 'Syed Areeb');  // Custom Headers should start with X- to avoid conflicts with standard headers
    // console.log(req.headers);
    return res.json(allDbUsers);
})

app
.route('/api/users/:id')
.get( async (req, res) => {
    const user = await User.findById(req.params.id);
    // const id = Number(req.params.id);
    // const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
})
.patch(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, {last_name: 'Rudy'});
    return res.json({ message: 'Success!' });
    // const id = Number(req.params.id);
    // const body = req.body || {};

    // const idx = users.findIndex(u => u.id === id);
    // if (idx === -1) {
    //     return res.status(404).json({ status: 'error', message: 'User not found' });
    // }

    // // Prevent changing the id
    // const updates = { ...body };
    // delete updates.id;

    // users[idx] = { ...users[idx], ...updates };

    // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
    //     if (err) return res.status(500).json({ status: 'error', message: 'Failed to save' });
    //     return res.json({ status: 'success', user: users[idx] });
    // });
})
.delete(async(req, res) => {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Success!' });
    // const id = Number(req.params.id);
    // const idx = users.findIndex(u => u.id === id);

    // if (idx === -1) {
    //     return res.status(404).json({ status: 'error', message: 'User not found' });
    // }
    // users.splice(idx, 1);
    // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
    //     if (err) return res.status(500).json({ status: 'error', message: 'Failed to save' });
    //     return res.json({ status: 'success', message: 'User deleted' });
    // });
});

app.post('/api/users', async (req, res) => {
    const body = req.body;
    if (!body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    // users.push({...body, id: users.length+1});
    // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    //     return res.status(201).json({status: 'Success!', id: users.length});
    // })

    const result = await User.create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        jobTitle: body.job_title,
        gender: body.gender
    })

    return res.status(201).json({ message: 'Success!'});
})

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));


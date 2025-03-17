const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { faker } = require('@faker-js/faker'); 

const app = express();
const PORT = 1337;

app.use(bodyParser.json());
app.use(cors());

const generateUsers = (count) => {
    const users = [];
    for (let i = 1; i <= count; i++) {
        users.push({
            id: i,
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: faker.internet.password(), 
            role: 'user',
            isBlocked: faker.datatype.boolean({ probability: 0.2 }), 
        });
    }
    return users;
};

let users = generateUsers(100); 
let reviews = [];

const ADMIN_CREDENTIALS = {
    email: 'admin@example.com', 
    password: 'qweqwe',  
};

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const userExists = users.some((u) => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = { id: users.length + 1, username, email, password, role: 'user' };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        return res.status(200).json({
            message: 'Login successful',
            user: { id: 0, username: 'Admin', email: ADMIN_CREDENTIALS.email, role: 'admin' },
        });
    }

    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
        res.status(200).json({ message: 'Login successful', user });
    } else {
        res.status(401).json({ error: 'Неверный email или пароль' });
    }
});

app.post('/api/feedback', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newReview = {
        id: Date.now(),
        name,
        email,
        message,
        date: new Date().toLocaleString(),
    };

    reviews.push(newReview);

    res.status(201).json({ message: 'Feedback submitted successfully', review: newReview });
});

app.get('/api/feedback', (req, res) => {
    res.status(200).json(reviews);
});

app.delete('/api/feedback/:id', (req, res) => {
    const { id } = req.params;

    const index = reviews.findIndex((review) => review.id === Number(id));

    if (index === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }

    reviews.splice(index, 1);

    res.status(200).json({ message: 'Review deleted successfully' });
});

app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const user = users.find((u) => u.id === Number(id));

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
});

app.put('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    const userIndex = users.findIndex((u) => u.id === Number(id));

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], username, email };

    res.status(200).json(users[userIndex]);
});

app.get('/api/admin/users', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    const results = users.slice(startIndex, startIndex + limit);

    res.status(200).json({
        users: results,
        total: users.length,
        currentPage: page,
        hasNext: startIndex + limit < users.length
    });
});

app.post('/api/admin/users/:id/block', (req, res) => {
    const { id } = req.params;
    const userToBlock = users.find((u) => u.id === Number(id));

    if (!userToBlock) {
        return res.status(404).json({ error: 'User not found' });
    }

    userToBlock.isBlocked = true;
    res.status(200).json({ message: 'User blocked successfully', user: userToBlock });
});

app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    const index = users.findIndex((u) => u.id === Number(id));

    if (index === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users.splice(index, 1);
    res.status(200).json({ message: 'User deleted successfully' });
});

app.get('/', (req, res) => {
    res.send('Hello, this is the server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
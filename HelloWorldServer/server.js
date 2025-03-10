const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = 1337;

app.use(bodyParser.json());
app.use(cors()); 

let users = [];
let reviews = [];

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const userExists = users.some(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = { id: users.length + 1, username, email, password };
    users.push(newUser);

    console.log(req);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`login request`);

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const user = users.find(u => u.email === email && u.password === password);

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

app.get('/', (req, res) => {
    res.send('Hello, this is the server!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
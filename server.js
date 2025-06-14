const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.API_SECRET || 'testsecret';

app.use(express.json());

// Middleware: Auth
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route: Token generator
app.post('/login', (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Route: Risk scoring
app.post('/score', authenticateToken, (req, res) => {
  const { income, creditScore, employmentStatus } = req.body;

  let score = 0;
  if (income > 30000) score += 20;
  if (creditScore > 650) score += 40;
  if (employmentStatus === 'full-time') score += 30;

  const decision = score >= 60 ? 'approved' : 'rejected';
  res.json({ decision, riskScore: score });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

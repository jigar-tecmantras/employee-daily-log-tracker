const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const PORT = process.env.PORT || 4001;

const authGuard = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      userId: payload.userId,
      role: payload.role,
      name: payload.name,
      email: payload.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Insufficient privileges' });
  }
  next();
};

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

app.get('/users', authGuard, requireRole('MANAGER'), async (req, res) => {
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true },
  });
  res.json(employees);
});

app.post('/logs', authGuard, async (req, res) => {
  if (req.user.role !== 'EMPLOYEE') {
    return res.status(403).json({ error: 'Only employees can submit logs' });
  }

  const { title, description, date } = req.body;

  if (!title?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const workDate = date ? new Date(date) : new Date();
  if (Number.isNaN(workDate.valueOf())) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  const startOfDay = new Date(workDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(workDate);
  endOfDay.setHours(23, 59, 59, 999);

  const alreadyExists = await prisma.log.findFirst({
    where: {
      userId: req.user.userId,
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  if (alreadyExists) {
    return res.status(400).json({ error: 'You already submitted a log for this date' });
  }

  const created = await prisma.log.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      date: workDate,
      userId: req.user.userId,
    },
  });

  res.status(201).json(created);
});

app.get('/logs', authGuard, async (req, res) => {
  const { employeeId, date } = req.query;
  const where = {};

  if (req.user.role === 'EMPLOYEE') {
    where.userId = req.user.userId;
  } else if (employeeId) {
    const parsed = Number(employeeId);
    if (Number.isNaN(parsed)) {
      return res.status(400).json({ error: 'employeeId must be a number' });
    }
    where.userId = parsed;
  }

  if (date) {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.valueOf())) {
      return res.status(400).json({ error: 'Invalid date filter' });
    }
    const startDate = new Date(parsedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(parsedDate);
    endDate.setHours(23, 59, 59, 999);
    where.date = { gte: startDate, lt: endDate };
  }

  const logs = await prisma.log.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  res.json(
    logs.map((log) => ({
      id: log.id,
      title: log.title,
      description: log.description,
      date: log.date,
      user: log.user,
      createdAt: log.createdAt,
    }))
  );
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Unable to fulfill the request at the moment' });
});

const server = app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server gracefully stopped');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
}

// Routes
app.get("/", (req, res) => {
  res.send("Attendance API is running.");
});

app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash: hashed },
    });
    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    res.status(400).json({ error: "User with this email already exists." });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(400).json({ error: "Invalid email or password." });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token });
});

app.post("/subjects", authMiddleware, async (req, res) => {
  const { subject_name } = req.body;
  if (!subject_name) {
    return res.status(400).json({ error: "Subject name is required." });
  }
  try {
    const subject = await prisma.subject.create({
      data: {
        subject_name,
        userId: req.userId,
        attendance: {
          createMany: {
            data: [
              { type: "class", total_classes: 0, attended_classes: 0 },
              { type: "lab", total_classes: 0, attended_classes: 0 },
            ],
          },
        },
      },
      include: {
        attendance: true,
      },
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: "Failed to add subject." });
  }
});

app.get("/subjects", authMiddleware, async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: { attendance: true },
    });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects." });
  }
});

app.post("/attendance", authMiddleware, async (req, res) => {
  const { subjectId, type, total_classes, attended_classes } = req.body;
  if (
    !subjectId ||
    !type ||
    total_classes == null ||
    attended_classes == null
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const updated = await prisma.attendance.upsert({
      where: {
        subjectId_type: {
          subjectId: subjectId,
          type: type,
        },
      },
      update: { total_classes, attended_classes },
      create: {
        subjectId,
        type,
        total_classes,
        attended_classes,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update attendance." });
  }
});

app.delete("/subjects/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.attendance.deleteMany({ where: { subjectId: id } });
    await prisma.subject.delete({ where: { id } });
    res.json({ message: "Subject deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete subject." });
  }
});

app.get("/report", authMiddleware, async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: { attendance: true },
    });
    let total = 0,
      attended = 0;
    subjects.forEach((sub) => {
      sub.attendance.forEach((att) => {
        total += att.total_classes;
        attended += att.attended_classes;
      });
    });
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    const needed =
      percentage >= 75 ? 0 : Math.ceil((75 * total - 100 * attended) / 25);
    res.json({ total, attended, percentage, needed });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate report." });
  }
});

// app.listen(PORT, "127.0.0.1", () =>
//   console.log(`Server running on http://127.0.0.1:${PORT}`)
// );
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

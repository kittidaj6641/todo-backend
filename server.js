const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// เชื่อมต่อ PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 1. ดึงข้อมูล Dashboard & ค้นหา/กรองงาน
// เพิ่มส่วนนี้เพื่อเช็คว่า Server ทำงานปกติที่หน้าแรก
app.get('/', (req, res) => {
  res.send('Backend Server is running properly!');
});

// 2. เพิ่มงานใหม่
app.post('/api/tasks', async (req, res) => {
  const { user_id, title, category, due_date, tagged_users } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, category, due_date, tagged_users) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id || 1, title, category, due_date, tagged_users || []]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. อัปเดตสถานะงาน
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ลบงาน
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
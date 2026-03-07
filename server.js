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
app.get('/api/tasks', async (req, res) => {
  const { user_id, search, status } = req.query;
  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    let params = [user_id || 1]; // ค่าเริ่มต้น 1 สำหรับทดสอบ
    let paramIndex = 2;

    if (search) {
      query += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    query += ' ORDER BY due_date ASC';

    const result = await pool.query(query, params);
    const tasks = result.rows;

    // สร้างข้อมูล Dashboard
    const dashboard = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };

    res.json({ dashboard, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
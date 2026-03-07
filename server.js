const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อ PostgreSQL ผ่าน DATABASE_URL จาก Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // จำเป็นสำหรับการเชื่อมต่อฐานข้อมูลภายนอกในบางกรณี
  }
});

// ตรวจสอบการเชื่อมต่อ Database ทันทีที่รัน Server
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error connecting to the database:', err.stack);
  }
  console.log('✅ Connected to PostgreSQL successfully');
  release();
});

// หน้าแรกสำหรับเช็คว่า Server ออนไลน์อยู่หรือไม่
app.get('/', (req, res) => {
  res.send('🚀 Backend Server is running properly!');
});

// 1. ดึงข้อมูล Dashboard & รายการงาน
app.get('/api/tasks', async (req, res) => {
  const { user_id, search, status } = req.query;
  try {
    // ใช้ user_id จาก query หรือ default เป็น 1
    const targetUserId = user_id || 1;
    
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    let params = [targetUserId];
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
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    const tasks = result.rows;

    // คำนวณข้อมูล Dashboard
    const dashboard = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };

    res.json({ dashboard, tasks });
  } catch (err) {
    console.error('Error executing GET /api/tasks:', err.message);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

// 2. เพิ่มงานใหม่
app.post('/api/tasks', async (req, res) => {
  const { user_id, title, category, due_date, tagged_users } = req.body;
  try {
    const targetUserId = user_id || 1;
    
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, category, due_date, tagged_users) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [targetUserId, title, category, due_date, tagged_users || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error executing POST /api/tasks:', err.message);
    res.status(500).json({ error: "Cannot add task: " + err.message });
  }
});

// 3. อัปเดตสถานะงาน
app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error executing PUT /api/tasks:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. ลบงาน
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error executing DELETE /api/tasks:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
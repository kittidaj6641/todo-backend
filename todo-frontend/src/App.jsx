import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/tasks';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0c0c0e;
    --surface: #141416;
    --surface2: #1c1c1f;
    --border: #2a2a2f;
    --border-light: #333338;
    --text: #f0efe8;
    --text-dim: #6b6b75;
    --text-mid: #9898a6;
    --accent: #e8ff47;
    --accent-dim: rgba(232,255,71,0.12);
    --red: #ff5b5b;
    --amber: #ffb547;
    --green: #4fffb0;
    --red-dim: rgba(255,91,91,0.12);
    --amber-dim: rgba(255,181,71,0.12);
    --green-dim: rgba(79,255,176,0.12);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
  }

  .app {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(232,255,71,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(79,255,176,0.03) 0%, transparent 60%);
    padding: 32px 24px 80px;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
  }

  /* ── HEADER ── */
  .header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--border);
    gap: 16px;
    flex-wrap: wrap;
  }

  .header-left {}

  .header-tag {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-tag::before {
    content: '';
    display: block;
    width: 20px;
    height: 1px;
    background: var(--accent);
  }

  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 800;
    color: var(--text);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .header-title span {
    color: var(--accent);
  }

  .header-time {
    font-size: 11px;
    color: var(--text-dim);
    text-align: right;
    line-height: 1.6;
  }

  /* ── STATS BAR ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 40px;
  }

  .stat-cell {
    background: var(--surface);
    padding: 24px 20px;
    position: relative;
    transition: background 0.2s;
  }

  .stat-cell:hover { background: var(--surface2); }

  .stat-cell::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 2px;
    border-radius: 2px;
    transition: opacity 0.2s;
  }

  .stat-cell.all::after    { background: var(--text-dim); opacity: 0.5; }
  .stat-cell.pending::after  { background: var(--red); opacity: 0.8; }
  .stat-cell.progress::after { background: var(--amber); opacity: 0.8; }
  .stat-cell.done::after   { background: var(--green); opacity: 0.8; }

  .stat-label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 10px;
  }

  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 40px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .stat-cell.all .stat-num    { color: var(--text); }
  .stat-cell.pending .stat-num  { color: var(--red); }
  .stat-cell.progress .stat-num { color: var(--amber); }
  .stat-cell.done .stat-num   { color: var(--green); }

  /* ── MAIN GRID ── */
  .main-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;
    align-items: start;
  }

  /* ── PANEL ── */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .panel-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text);
  }

  .panel-count {
    font-size: 11px;
    color: var(--text-dim);
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 2px 10px;
    border-radius: 20px;
  }

  .panel-body {
    padding: 24px;
  }

  /* ── FORM ── */
  .field {
    margin-bottom: 16px;
  }

  .field-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 6px;
    display: block;
  }

  .field input, .field select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }

  .field input::placeholder { color: var(--text-dim); }
  .field input:focus {
    border-color: var(--accent);
    background: rgba(232,255,71,0.04);
  }

  .field input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1) opacity(0.3);
    cursor: pointer;
  }

  .submit-btn {
    width: 100%;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    margin-top: 8px;
  }

  .submit-btn:hover { opacity: 0.88; }
  .submit-btn:active { transform: scale(0.98); }

  /* ── SEARCH / FILTER BAR ── */
  .toolbar {
    display: flex;
    gap: 10px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface2);
  }

  .search-wrap {
    flex: 1;
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: var(--text-dim);
    pointer-events: none;
  }

  .search-wrap input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 9px 12px 9px 34px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
  }

  .search-wrap input::placeholder { color: var(--text-dim); }
  .search-wrap input:focus { border-color: var(--border-light); }

  .filter-select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 9px 12px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--text-mid);
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    min-width: 130px;
  }

  /* ── TASK LIST ── */
  .task-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 600px;
    overflow-y: auto;
  }

  .task-list::-webkit-scrollbar { width: 4px; }
  .task-list::-webkit-scrollbar-track { background: transparent; }
  .task-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  .task-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: center;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
  }

  .task-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
  }

  .task-card.pending::before  { background: var(--red); }
  .task-card.in_progress::before { background: var(--amber); }
  .task-card.completed::before { background: var(--green); }

  .task-card:hover {
    border-color: var(--border-light);
    background: #202024;
  }

  .task-name {
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }

  .task-name.done {
    color: var(--text-dim);
    text-decoration: line-through;
  }

  .task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .badge {
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 5px;
    letter-spacing: 0.05em;
    border: 1px solid;
    font-family: 'DM Mono', monospace;
  }

  .badge.cat   { background: rgba(100,100,255,0.1); color: #8888ff; border-color: rgba(100,100,255,0.2); }
  .badge.date  { background: var(--surface); color: var(--text-mid); border-color: var(--border); }
  .badge.user  { background: rgba(200,100,255,0.08); color: #cc88ff; border-color: rgba(200,100,255,0.15); }

  .task-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .status-select {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.05em;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    text-align: center;
    font-weight: 500;
  }

  .status-select.pending   { background: var(--red-dim);   color: var(--red);   border-color: rgba(255,91,91,0.25); }
  .status-select.in_progress { background: var(--amber-dim); color: var(--amber); border-color: rgba(255,181,71,0.25); }
  .status-select.completed  { background: var(--green-dim); color: var(--green); border-color: rgba(79,255,176,0.25); }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 11px;
    color: var(--text-dim);
    padding: 4px 6px;
    border-radius: 5px;
    transition: color 0.2s, background 0.2s;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.05em;
  }

  .delete-btn:hover { color: var(--red); background: var(--red-dim); }

  /* ── EMPTY ── */
  .empty {
    padding: 60px 24px;
    text-align: center;
  }

  .empty-icon {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.4;
  }

  .empty-text {
    font-size: 12px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 860px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
    .stats-row {
      grid-template-columns: repeat(2, 1fr);
    }
    .task-list { max-height: none; }
  }

  @media (max-width: 480px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .app { padding: 20px 16px 60px; }
    .toolbar { flex-direction: column; }
    .stat-num { font-size: 30px; }
  }
`;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTask, setNewTask] = useState({ title: '', category: '', due_date: '', tagged_users: '' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}&status=${filterStatus}`);
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
        setDashboard(res.data.dashboard);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchTasks(); }, [search, filterStatus]);

  const addTask = async (e) => {
    e.preventDefault();
    const taggedArray = newTask.tagged_users.split(',').map(t => t.trim()).filter(Boolean);
    await axios.post(API_URL, { ...newTask, tagged_users: taggedArray });
    setNewTask({ title: '', category: '', due_date: '', tagged_users: '' });
    fetchTasks();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API_URL}/${id}`, { status });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchTasks();
  };

  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="container">

          {/* HEADER */}
          <header className="header">
            <div className="header-left">
              <div className="header-tag">Task OS</div>
              <h1 className="header-title">WORK<span>.</span><br />BOARD</h1>
            </div>
            <div className="header-time">
              <div style={{ fontSize: '22px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{timeStr}</div>
              <div>{dateStr}</div>
            </div>
          </header>

          {/* STATS */}
          <div className="stats-row">
            <div className="stat-cell all">
              <div className="stat-label">Total</div>
              <div className="stat-num">{String(dashboard.total).padStart(2, '0')}</div>
            </div>
            <div className="stat-cell pending">
              <div className="stat-label">Pending</div>
              <div className="stat-num">{String(dashboard.pending).padStart(2, '0')}</div>
            </div>
            <div className="stat-cell progress">
              <div className="stat-label">In Progress</div>
              <div className="stat-num">{String(dashboard.in_progress).padStart(2, '0')}</div>
            </div>
            <div className="stat-cell done">
              <div className="stat-label">Done</div>
              <div className="stat-num">{String(dashboard.completed).padStart(2, '0')}</div>
            </div>
          </div>

          {/* MAIN */}
          <div className="main-grid">

            {/* ADD TASK PANEL */}
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">New Task</span>
                <span style={{ fontSize: '16px' }}>＋</span>
              </div>
              <div className="panel-body">
                <form onSubmit={addTask}>
                  <div className="field">
                    <label className="field-label">Title *</label>
                    <input required type="text" placeholder="ชื่องาน..."
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label">Category</label>
                    <input type="text" placeholder="Dev / Design / Meeting"
                      value={newTask.category}
                      onChange={e => setNewTask({ ...newTask, category: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label">Due Date</label>
                    <input type="datetime-local"
                      value={newTask.due_date}
                      onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="field-label">Tag Users</label>
                    <input type="text" placeholder="john, jane, ..."
                      value={newTask.tagged_users}
                      onChange={e => setNewTask({ ...newTask, tagged_users: e.target.value })} />
                  </div>
                  <button type="submit" className="submit-btn">+ Add Task</button>
                </form>
              </div>
            </div>

            {/* TASK LIST PANEL */}
            <div className="panel">
              <div className="toolbar">
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="ค้นหางาน..."
                    value={search}
                    onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">ทุกสถานะ</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="panel-header" style={{ background: 'var(--surface2)' }}>
                <span className="panel-title">Tasks</span>
                <span className="panel-count">{tasks.length} items</span>
              </div>

              <div className="task-list">
                {tasks.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">📭</div>
                    <div className="empty-text">No tasks found</div>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className={`task-card ${task.status}`}>
                      <div>
                        <div className={`task-name ${task.status === 'completed' ? 'done' : ''}`}>
                          {task.title}
                        </div>
                        <div className="task-meta">
                          {task.category && <span className="badge cat">📁 {task.category}</span>}
                          {task.due_date && (
                            <span className="badge date">
                              ⏳ {new Date(task.due_date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                          {task.tagged_users?.map(u => (
                            <span key={u} className="badge user">@{u}</span>
                          ))}
                        </div>
                      </div>
                      <div className="task-actions">
                        <select
                          className={`status-select ${task.status}`}
                          value={task.status}
                          onChange={e => updateStatus(task.id, e.target.value)}
                        >
                          <option value="pending">PENDING</option>
                          <option value="in_progress">IN PROGRESS</option>
                          <option value="completed">DONE</option>
                        </select>
                        <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                          🗑 DEL
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
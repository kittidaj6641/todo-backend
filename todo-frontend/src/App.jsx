import { useState, useEffect } from 'react';
import axios from 'axios';

// URL ของ API (เปลี่ยนเป็น URL ของ Railway ตอน Deploy)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form State
  const [newTask, setNewTask] = useState({ title: '', category: '', due_date: '', tagged_users: '' });

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}?search=${search}&status=${filterStatus}`);
      setTasks(res.data.tasks);
      setDashboard(res.data.dashboard);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filterStatus]);

  const addTask = async (e) => {
    e.preventDefault();
    const taggedArray = newTask.tagged_users.split(',').map(tag => tag.trim()).filter(t => t);
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Task Management Dashboard</h1>

        {/* Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-500">งานทั้งหมด</h3>
            <p className="text-3xl font-bold">{dashboard.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <h3 className="text-gray-500">รอดำเนินการ</h3>
            <p className="text-3xl font-bold">{dashboard.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-gray-500">กำลังทำ</h3>
            <p className="text-3xl font-bold">{dashboard.in_progress}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-500">เสร็จสิ้น</h3>
            <p className="text-3xl font-bold">{dashboard.completed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ฟอร์มเพิ่มงาน */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4">➕ เพิ่มงานใหม่</h2>
            <form onSubmit={addTask} className="space-y-4">
              <input required type="text" placeholder="ชื่องาน" className="w-full border p-2 rounded" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <input type="text" placeholder="หมวดหมู่ (เช่น Dev, Design)" className="w-full border p-2 rounded" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} />
              <input type="datetime-local" className="w-full border p-2 rounded" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
              <input type="text" placeholder="แท็กผู้เกี่ยวข้อง (คั่นด้วยลูกน้ำ เช่น john, jane)" className="w-full border p-2 rounded" value={newTask.tagged_users} onChange={e => setNewTask({...newTask, tagged_users: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">เพิ่มงาน</button>
            </form>
          </div>

          {/* รายการงาน */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex gap-4 mb-6">
              <input type="text" placeholder="🔍 ค้นหางาน..." className="border p-2 rounded w-full" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="border p-2 rounded" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">ทุกสถานะ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="in_progress">กำลังทำ</option>
                <option value="completed">เสร็จสิ้น</option>
              </select>
            </div>

            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
                  <div>
                    <h4 className="font-bold text-lg">{task.title}</h4>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">📁 {task.category}</span>
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">⏳ {new Date(task.due_date).toLocaleString()}</span>
                      {task.tagged_users && task.tagged_users.map(user => (
                        <span key={user} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">@{user}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <select 
                      className={`text-sm p-1 rounded border ${task.status === 'completed' ? 'bg-green-100' : task.status === 'in_progress' ? 'bg-yellow-100' : 'bg-red-100'}`}
                      value={task.status} 
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                    >
                      <option value="pending">รอดำเนินการ</option>
                      <option value="in_progress">กำลังทำ</option>
                      <option value="completed">เสร็จสิ้น</option>
                    </select>
                    <button onClick={() => deleteTask(task.id)} className="text-red-500 text-sm hover:underline">🗑️ ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
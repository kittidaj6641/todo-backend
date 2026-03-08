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
      if (res.data && res.data.tasks) {
        setTasks(res.data.tasks);
        setDashboard(res.data.dashboard);
      }
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
            Task Management
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">จัดการงานของคุณอย่างมีประสิทธิภาพ</p>
        </div>

        {/* Dashboard Cards (Responsive: 1 col mobile, 2 tablet, 4 desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-blue-500 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-slate-500 font-medium mb-1">📋 งานทั้งหมด</h3>
            <p className="text-4xl font-bold text-slate-800">{dashboard.total}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-red-500 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-slate-500 font-medium mb-1">🔥 รอดำเนินการ</h3>
            <p className="text-4xl font-bold text-red-600">{dashboard.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-amber-400 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-slate-500 font-medium mb-1">⚡ กำลังทำ</h3>
            <p className="text-4xl font-bold text-amber-500">{dashboard.in_progress}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-emerald-500 hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-slate-500 font-medium mb-1">✅ เสร็จสิ้น</h3>
            <p className="text-4xl font-bold text-emerald-600">{dashboard.completed}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ฟอร์มเพิ่มงาน */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm h-fit border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">➕</span> เพิ่มงานใหม่
            </h2>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">ชื่องาน <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="เช่น สรุปรายงานการประชุม..." 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
                  value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">หมวดหมู่</label>
                <input type="text" placeholder="เช่น Dev, Design, Meeting" 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
                  value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">กำหนดส่ง</label>
                <input type="datetime-local" 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
                  value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">แท็กผู้เกี่ยวข้อง</label>
                <input type="text" placeholder="คั่นด้วยลูกน้ำ ( , ) เช่น john, jane" 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
                  value={newTask.tagged_users} onChange={e => setNewTask({...newTask, tagged_users: e.target.value})} />
              </div>

              <button type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg hover:opacity-90 active:scale-95 transition-all mt-2">
                บันทึกงาน
              </button>
            </form>
          </div>

          {/* รายการงาน */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
            
            {/* Search & Filter (Responsive layout) */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
                <input type="text" placeholder="ค้นหางาน..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select 
                className="py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 min-w-[150px] cursor-pointer" 
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">🎯 ทุกสถานะ</option>
                <option value="pending">🔥 รอดำเนินการ</option>
                <option value="in_progress">⚡ กำลังทำ</option>
                <option value="completed">✅ เสร็จสิ้น</option>
              </select>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-500">ไม่พบรายการงานในขณะนี้ 📭</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="group border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:border-blue-200 hover:shadow-md transition-all gap-4 relative overflow-hidden">
                    
                    {/* ขีดสีบอกสถานะด้านซ้ายมือ */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-amber-400' : 'bg-red-500'}`}></div>

                    {/* ข้อมูลงาน */}
                    <div className="flex-1 pl-2">
                      <h4 className={`font-bold text-lg mb-2 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {task.category && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            📁 {task.category}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                            ⏳ {new Date(task.due_date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                        {task.tagged_users && task.tagged_users.length > 0 && task.tagged_users.map(user => (
                          <span key={user} className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-md text-xs font-medium">
                            @{user}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ปุ่มจัดการ (สถานะ & ลบ) */}
                    <div className="flex sm:flex-col flex-row justify-between w-full sm:w-auto items-center sm:items-end gap-3 border-t sm:border-none border-slate-100 pt-4 sm:pt-0">
                      <select 
                        className={`text-sm py-1.5 px-3 rounded-lg border font-medium focus:outline-none cursor-pointer transition-colors
                          ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            task.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-red-50 text-red-700 border-red-200'}`}
                        value={task.status} 
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="in_progress">กำลังทำ</option>
                        <option value="completed">เสร็จสิ้น</option>
                      </select>
                      
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="text-slate-400 hover:text-red-500 text-sm flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        🗑️ ลบ
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
  );
}

export default App;
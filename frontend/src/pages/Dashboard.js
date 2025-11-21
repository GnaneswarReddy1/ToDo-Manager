import React, { useState, useEffect, useRef } from 'react'; 
import { tasksApi, aiApi, setAuthHeader } from '../api';
import TaskList from '../components/TaskList';
import QuickAdd from '../components/QuickAdd';
import TaskEditor from '../components/TaskEditor';
import AIPreviewModal from '../components/AIPreviewModal';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const TAG_OPTIONS = [
  { label: 'Important', color: '#ff4d4f' },
  { label: 'Work', color: '#1890ff' },
  { label: 'Leisure', color: '#52c41a' },
  { label: 'Urgent', color: '#faad14' },
  { label: 'Personal', color: '#722ed1' }
];

export default function Dashboard({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [editing, setEditing] = useState(null);
  const [aiPreview, setAiPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('light');

  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [tagFilter, setTagFilter] = useState('');

  const addPanelRef = useRef();
  const navigate = useNavigate();

  // ------------------------
  // Load tasks for current user
  // ------------------------
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('smarttodo_token');
      if (!token) {
        navigate('/login');
        return;
      }
      setAuthHeader(token); // ensure Axios uses correct token
      await load();
    }
    init();
  }, [user]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const all = await tasksApi.list();
      setTasks(all.filter(t => !t.completed));
      setCompletedTasks(all.filter(t => t.completed));
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks.');
      setTasks([]);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(payload) {
    const created = await tasksApi.create(payload);
    if (created.completed) setCompletedTasks(prev => [created, ...prev]);
    else setTasks(prev => [created, ...prev]);
    setActiveTab('active');
    return created;
  }

  async function handleAICreate(text, selectedTags = []) {
    try {
      const resp = await aiApi.parse(text);
      const parsed = resp.parsed;
      const generateTitle = (text) => text.split(' ').slice(0, 4).join(' ');
      const previewData = {
        title: parsed.title || generateTitle(text),
        notes: parsed.notes || text,
        dueDate: parsed.dueDate || null,
        time: parsed.time || null,
        priority: parsed.priority || 'medium',
        tags: [...(parsed.tags || []), ...selectedTags]
      };
      setAiPreview(previewData);
    } catch (err) {
      console.error('AI parsing failed:', err);
      const previewData = {
        title: text.split(' ').slice(0, 4).join(' '),
        notes: text,
        dueDate: null,
        time: null,
        priority: 'medium',
        tags: selectedTags
      };
      setAiPreview(previewData);
    }
  }

  async function confirmAICreate(finalData) {
    try {
      let dueDateTime = null;
      if (finalData.dueDate) {
        if (finalData.time) {
          const [hours, minutes] = finalData.time.split(':');
          dueDateTime = new Date(finalData.dueDate);
          dueDateTime.setHours(parseInt(hours), parseInt(minutes));
        } else {
          dueDateTime = new Date(finalData.dueDate);
        }
      }

      await createTask({
        title: finalData.title,
        notes: finalData.notes,
        dueDate: dueDateTime,
        priority: finalData.priority,
        tags: finalData.tags
      });
      setAiPreview(null);
    } catch (err) {
      console.error('Failed to create AI task:', err);
      alert('Failed to create task. Please try again.');
    }
  }

  function cancelAICreate() {
    setAiPreview(null);
  }

  async function handleToggleComplete(task, completed) {
    const msg = completed
      ? 'Mark this task as completed?'
      : 'Move this task back to Active tasks?';
    if (!window.confirm(msg)) return;

    try {
      const updated = await tasksApi.update(task._id, { ...task, completed });
      if (completed) {
        setTasks(prev => prev.filter(t => t._id !== task._id));
        setCompletedTasks(prev => [updated, ...prev]);
      } else {
        setCompletedTasks(prev => prev.filter(t => t._id !== task._id));
        setTasks(prev => [updated, ...prev]);
      }
    } catch (err) { console.error(err); }
  }

  async function updateTask(id, payload) {
    try {
      const updated = await tasksApi.update(id, payload);
      if (updated.completed) {
        setTasks(prev => prev.filter(t => t._id !== id));
        setCompletedTasks(prev => [updated, ...prev]);
      } else {
        setCompletedTasks(prev => prev.filter(t => t._id !== id));
        setTasks(prev => prev.map(t => t._id === id ? updated : t));
      }
      return updated;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }

  const getFilteredTasks = (list) => {
    let filtered = list;
    if (searchText) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    if (tagFilter) filtered = filtered.filter(t => t.tags.includes(tagFilter));
    if (sortOrder === 'asc') filtered.sort((a,b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));
    if (sortOrder === 'desc') filtered.sort((a,b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0));
    return filtered;
  };

  return (
    <div className={`dashboard-root ${theme}`}>
      <div className="dashboard-container">
        <div className="dashboard-tabs">
          <button className={activeTab==='active'?'active':''} onClick={()=>setActiveTab('active')}>
            Active Tasks ({tasks.length})
          </button>
          <button className={activeTab==='completed'?'active':''} onClick={()=>setActiveTab('completed')}>
            Completed ({completedTasks.length})
          </button>
          <button className={activeTab==='add'?'active':''} onClick={()=>setActiveTab('add')}>
            Add New Task
          </button>
        </div>

        {loading && <div className="loading-state">Loading tasks...</div>}
        {error && <div className="error-message">{error}</div>}

        {(activeTab==='active' || activeTab==='completed') && (
          <div style={{ display:'flex', gap:12, margin:'12px 0', flexWrap:'wrap' }}>
            <input
              className="input"
              placeholder="Search tasks..."
              value={searchText}
              onChange={e=>setSearchText(e.target.value)}
              style={{ flex:'0 0 50%' }}
            />
            <select
              className="input"
              value={sortOrder}
              onChange={e=>setSortOrder(e.target.value)}
              style={{ flex:'0 0 20%' }}
            >
              <option value="asc">Due Date ↑</option>
              <option value="desc">Due Date ↓</option>
            </select>
            <select
              className="input"
              value={tagFilter}
              onChange={e=>setTagFilter(e.target.value)}
              style={{ flex:'0 0 20%' }}
            >
              <option value="">All Tags</option>
              {TAG_OPTIONS.map(t=>(<option key={t.label} value={t.label}>{t.label}</option>))}
            </select>
          </div>
        )}

        <div className={`add-panel ${activeTab==='add'?'open':'closed'}`} ref={addPanelRef}>
          <QuickAdd onAICreate={handleAICreate} onManualCreate={createTask} tagOptions={TAG_OPTIONS} />
        </div>

        {aiPreview && (
          <AIPreviewModal taskData={aiPreview} onConfirm={confirmAICreate} onCancel={cancelAICreate} tagOptions={TAG_OPTIONS} />
        )}

        {!loading && !error && activeTab==='active' && (
          <TaskList 
            tasks={getFilteredTasks(tasks)} 
            onEdit={setEditing} 
            onDelete={id=>setTasks(prev=>prev.filter(t=>t._id!==id))} 
            onToggle={handleToggleComplete} 
            panel='active'
          />
        )}
        {!loading && !error && activeTab==='completed' && (
          <TaskList 
            tasks={getFilteredTasks(completedTasks)} 
            onEdit={setEditing} 
            onDelete={id=>setCompletedTasks(prev=>prev.filter(t=>t._id!==id))} 
            onToggle={handleToggleComplete} 
            panel='completed'
          />
        )}

        {editing && (
          <TaskEditor task={editing} onClose={()=>setEditing(null)} onSave={updateTask} tagOptions={TAG_OPTIONS} />
        )}
      </div>
    </div>
  );
}

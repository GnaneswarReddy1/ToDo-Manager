import React from 'react';

export default function TaskList({ tasks=[], onDelete, onEdit, onToggle, panel='active' }) {
  if (!tasks.length) return <div style={{ marginTop:20 }}>No tasks yet.</div>;

  return (
    <div style={{ marginTop:20 }}>
      {tasks.map(t=>(
        <div key={t._id} className={`task ${t.completed?'completed':''}`}>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={e=>onToggle(t,e.target.checked)}
            />
            <div>
              <div style={{ fontWeight:600, textDecoration:t.completed?'line-through':'none' }}>{t.title}</div>
              {t.notes && <div className="small">{t.notes}</div>}
              {t.tags && <div style={{ marginTop:6 }}>{t.tags.map(tag=><span key={tag} className="tag">#{tag}</span>)}</div>}
              {t.dueDate && <div className="small" style={{ marginTop:2 }}>Due: {new Date(t.dueDate).toLocaleString()}</div>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="button" onClick={()=>onEdit(t)}>Edit</button>
            <button className="button" style={{ background:'#ff4d4f' }} onClick={()=>{if(confirm('Delete task?')) onDelete(t._id)}}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

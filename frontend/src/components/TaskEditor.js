import React, { useState } from 'react';

export default function TaskEditor({ task, onClose, onSave }) {
  const [title, setTitle] = useState(task.title || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [tags, setTags] = useState((task.tags || []).join(','));
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [dueTime, setDueTime] = useState(task.dueDate ? new Date(task.dueDate).toTimeString().slice(0,5) : '');

  async function save(){
    let dt = dueDate ? new Date(dueDate) : null;
    if (dt && dueTime) {
      const [hh, mm] = dueTime.split(':');
      dt.setHours(parseInt(hh,10));
      dt.setMinutes(parseInt(mm,10));
    }

    const payload = {
      title,
      notes,
      priority,
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      dueDate: dt,
      completed: task.completed || false
    };
    await onSave(task._id, payload);
    onClose();
  }

  return (
    <div className="container" style={{position:'fixed', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'90%', maxWidth:600, zIndex:1000}}>
      <h3>Edit Task</h3>
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title"/>
      <textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder="Notes"/>
      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:6}}>
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="input" style={{width:120}}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <input type="date" className="input" value={dueDate} onChange={e=>setDueDate(e.target.value)}/>
        <input type="time" className="input" value={dueTime} onChange={e=>setDueTime(e.target.value)}/>
        <input className="input" value={tags} onChange={e=>setTags(e.target.value)} placeholder="tags comma separated"/>
      </div>
      <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
        <button className="button" onClick={save}>Save</button>
        <button className="button" style={{background:'#aaa'}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

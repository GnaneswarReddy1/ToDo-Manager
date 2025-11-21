import React, { useState, useEffect } from "react";
import { parseDate } from "chrono-node";

// ---------- DATE PARSING HELPER ----------
function parseDateTime(input) {
  if (!input) return null;

  // If backend already sent ISO → accept it
  const direct = new Date(input);
  if (!isNaN(direct.getTime())) return direct;

  // Natural language: tomorrow, next Friday, at 6pm…
  const chronoParsed = parseDate(input);
  if (chronoParsed) return chronoParsed;

  return null;
}

// ==========================================
//            COMPONENT START
// ==========================================
export default function AIPreviewModal({ taskData, onConfirm, onCancel, tagOptions = [] }) {
  const [editedTask, setEditedTask] = useState({
    title: "",
    notes: "",
    dueDate: "",
    time: "",
    priority: "medium",
    tags: []
  });

  // Sync incoming taskData with modal fields
  useEffect(() => {
    if (taskData) {
      const parsed = parseDateTime(taskData.dueDate);

      let dueDate = "";
      let time = "";

      if (parsed) {
        dueDate = parsed.toISOString().split("T")[0]; // yyyy-mm-dd
        time = parsed.toTimeString().slice(0, 5); // hh:mm
      }

      setEditedTask({
        title: taskData.title || "",
        notes: taskData.notes || "",
        dueDate,
        time,
        priority: taskData.priority || "medium",
        tags: taskData.tags || []
      });
    }
  }, [taskData]);

  // Handle field edit
  const handleFieldChange = (field, value) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit final task
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editedTask.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    let dueDateTime = null;
    if (editedTask.dueDate) {
      if (editedTask.time) {
        dueDateTime = new Date(`${editedTask.dueDate}T${editedTask.time}`);
      } else {
        dueDateTime = new Date(editedTask.dueDate);
      }

      if (isNaN(dueDateTime.getTime())) {
        alert("Invalid date/time selected");
        return;
      }
    }

    const finalTask = {
      title: editedTask.title.trim(),
      notes: editedTask.notes.trim(),
      dueDate: dueDateTime,
      priority: editedTask.priority,
      tags: editedTask.tags
    };

    onConfirm(finalTask);
  };

  // ==========================================
  //                 UI
  // ==========================================
  return (
    <div className="ai-preview-modal">
      <div className="ai-preview-overlay" onClick={onCancel}></div>

      <div className="ai-preview-content">
        <div className="preview-header">
          <div className="preview-icon">🤖</div>
          <div>
            <h2>AI Task Preview</h2>
            <p>Review and edit the parsed task details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="preview-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="form-input"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={editedTask.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              rows={1}
              className="form-textarea"
              placeholder="Add task description..."
            />
          </div>

          {/* Date, Time, Priority */}
          <div className="form-row form-row-inline">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={editedTask.dueDate}
                onChange={(e) => handleFieldChange("dueDate", e.target.value)}
                className="form-input form-input-compact"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                value={editedTask.time}
                onChange={(e) => handleFieldChange("time", e.target.value)}
                className="form-input form-input-compact"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                value={editedTask.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                className="form-select form-input-compact"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={editedTask.tags[0] || ""}
              onChange={(e) => {
                const selected = e.target.value;
                setEditedTask(prev => ({
                  ...prev,
                  tags: selected ? [selected] : []
                }));
              }}
            >
              <option value="">Select category...</option>
              {tagOptions.map(tag => (
                <option key={tag.label} value={tag.label}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="preview-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span className="btn-icon">✅</span>
              Create Task
            </button>
          </div>
        </form>
      </div>

      {/* --------------- INLINE CSS --------------- */}
      <style jsx>{`
        .ai-preview-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }
        .ai-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        .ai-preview-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          max-height: 100vh;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* -------- HEADER -------- */
        .preview-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .preview-icon {
          font-size: 22px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 5px;
        }
        .preview-header h2 {
          margin: 0 0 2px 0;
          font-size: 20px;
          font-weight: 700;
        }
        .preview-header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        /* -------- FORM -------- */
        .preview-form {
          padding: 14px;
          max-height: calc(90vh - 120px);
          overflow-y: auto;
        }
        .form-group { margin-bottom: 6px; }
        .form-row-inline {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }
        .form-label {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }
        .form-input-compact {
          padding: 10px;
          font-size: 13px;
        }

        /* -------- BUTTONS -------- */
        .preview-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 14px 20px;
          border-radius: 8px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-icon { font-size: 16px; }
      `}</style>
    </div>
  );
}

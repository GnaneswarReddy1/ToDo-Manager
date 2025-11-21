import axios from 'axios';

// Base API URL from .env
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

// --- GLOBAL AXIOS SETTINGS ---
axios.defaults.baseURL = API_BASE;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';

// --- AUTH HEADER SETTER ---
export function setAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// --- AUTH API ---
export const authApi = {
  signup: async (payload) => {
    const res = await axios.post('/auth/signup', payload);
    return res.data;
  },
  login: async (payload) => {
    const res = await axios.post('/auth/login', payload);
    return res.data;
  },
};

// --- TASKS API ---
export const tasksApi = {
  list: async (params) => {
    const res = await axios.get('/tasks', { params });
    return res.data;
  },
  create: async (payload) => {
    const res = await axios.post('/tasks', payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await axios.put(`/tasks/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await axios.delete(`/tasks/${id}`);
    return res.data;
  },
};

// --- AI PARSE API ---
export const aiApi = {
  parse: async (text) => {
    try {
      const res = await axios.post('/ai/parse', { text });
      return res.data;
    } catch (error) {
      console.error('AI parse API error:', error);
      // Fallback to client-side parsing if API fails
      return { 
        source: 'fallback', 
        parsed: parseTextManually(text) 
      };
    }
  }
};

// Client-side fallback parser (in case backend fails)
function parseTextManually(text) {
  const parsed = {
    title: '',
    notes: '',
    dueDate: null,
    time: null,
    priority: 'medium',
    tags: []
  };

  // Generate title (first 4 words)
  const words = text.split(' ').filter(word => word.length > 0);
  parsed.title = words.slice(0, 4).join(' ');
  parsed.notes = text;

  // Extract date patterns
  const today = new Date();
  
  // Check for "tomorrow"
  if (text.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    parsed.dueDate = tomorrow.toISOString();
  }
  
  // Check for "today"
  if (text.toLowerCase().includes('today')) {
    parsed.dueDate = today.toISOString();
  }

  // Extract time patterns
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const period = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    parsed.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // If we have a date but no time was set, combine them
    if (parsed.dueDate && !parsed.dueDate.includes('T')) {
      const dateObj = new Date(parsed.dueDate);
      dateObj.setHours(hours, minutes);
      parsed.dueDate = dateObj.toISOString();
    }
  }

  return parsed;
}
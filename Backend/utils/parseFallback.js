// utils/parseFallback.js - Professional enhanced parser
function parseFallback(text) {
  const result = {
    title: '',
    notes: '',
    dueDate: null,
    priority: 'medium',
    tags: []
  };

  const lowerText = text.toLowerCase().trim();
  const words = text.split(' ').filter(w => w.length > 0);
  
  // Remove common filler words for better title extraction
  const fillerWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const meaningfulWords = words.filter(word => !fillerWords.has(word.toLowerCase()));

  // Smart title extraction (3-5 meaningful words)
  const titleLength = Math.min(Math.max(3, meaningfulWords.length), 5);
  result.title = meaningfulWords.slice(0, titleLength).join(' ') || words.slice(0, 4).join(' ');
  
  // Notes are the full text
  result.notes = text;

  // Enhanced date parsing
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Date patterns with improved matching
  const datePatterns = [
    { pattern: /\b(tomorrow)\b/i, offset: 1 },
    { pattern: /\b(today)\b/i, offset: 0 },
    { pattern: /\b(day after tomorrow)\b/i, offset: 2 },
    { pattern: /\b(next week)\b/i, offset: 7 },
    { pattern: /\b(next monday|mon)\b/i, getDate: () => getNextWeekday(1) },
    { pattern: /\b(next tuesday|tue)\b/i, getDate: () => getNextWeekday(2) },
    { pattern: /\b(next wednesday|wed)\b/i, getDate: () => getNextWeekday(3) },
    { pattern: /\b(next thursday|thu)\b/i, getDate: () => getNextWeekday(4) },
    { pattern: /\b(next friday|fri)\b/i, getDate: () => getNextWeekday(5) },
    { pattern: /\b(next saturday|sat)\b/i, getDate: () => getNextWeekday(6) },
    { pattern: /\b(next sunday|sun)\b/i, getDate: () => getNextWeekday(0) },
    { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/, parseDate: (match) => {
      const [month, day, year] = match.split('/').map(Number);
      return new Date(year, month - 1, day);
    }},
    { pattern: /\b(\d{4}-\d{2}-\d{2})\b/, parseDate: (match) => new Date(match) },
    { pattern: /\b(\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december))\b/i, parseDate: (match) => {
      const [day, month] = match.split(' ');
      const monthIndex = ['january','february','march','april','may','june','july','august','september','october','november','december']
        .indexOf(month.toLowerCase());
      const year = new Date().getFullYear();
      return new Date(year, monthIndex, parseInt(day));
    }}
  ];

  // Find and parse date
  for (const { pattern, offset, getDate, parseDate } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (offset !== undefined) {
        const date = new Date(today);
        date.setDate(date.getDate() + offset);
        result.dueDate = date.toISOString();
        break;
      } else if (getDate) {
        result.dueDate = getDate().toISOString();
        break;
      } else if (parseDate) {
        result.dueDate = parseDate(match[0]).toISOString();
        break;
      }
    }
  }

  // Enhanced time parsing
  const timePatterns = [
    // 12-hour format with AM/PM
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
    // 24-hour format
    /\b(\d{1,2}):(\d{2})\b/,
    // Simple hours
    /\b(\d{1,2})\s*(o'clock)?\b/
  ];

  let parsedTime = null;
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const period = match[3] ? match[3].toLowerCase() : '';

      // Convert to 24-hour format
      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      parsedTime = { hours, minutes };
      break;
    }
  }

  // Combine date and time if both are found
  if (result.dueDate && parsedTime) {
    const dateWithTime = new Date(result.dueDate);
    dateWithTime.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    result.dueDate = dateWithTime.toISOString();
  }

  // Smart priority detection
  const priorityKeywords = {
    high: ['urgent', 'asap', 'important', 'critical', 'emergency', 'immediately', 'now'],
    low: ['someday', 'maybe', 'optional', 'not important', 'low priority', 'whenever']
  };

  for (const [priority, keywords] of Object.entries(priorityKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.priority = priority;
      break;
    }
  }

  // Smart tag extraction
  const tagKeywords = {
    'Work': ['meeting', 'work', 'office', 'project', 'deadline', 'client', 'business'],
    'Personal': ['personal', 'family', 'home', 'shopping', 'errand'],
    'Health': ['doctor', 'appointment', 'health', 'medical', 'exercise', 'gym'],
    'Education': ['school', 'study', 'homework', 'class', 'learning', 'course'],
    'Finance': ['bill', 'payment', 'bank', 'money', 'finance', 'tax'],
    'Travel': ['travel', 'flight', 'hotel', 'trip', 'vacation']
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      result.tags.push(tag);
    }
  }

  // Add context-based tags
  if (lowerText.includes('appointment')) result.tags.push('Appointment');
  if (lowerText.includes('call') || lowerText.includes('phone')) result.tags.push('Call');
  if (lowerText.includes('email')) result.tags.push('Email');
  if (lowerText.includes('review')) result.tags.push('Review');

  return result;
}

// Helper function to get next specific weekday
function getNextWeekday(weekday) {
  const today = new Date();
  const result = new Date(today);
  result.setDate(today.getDate() + ((7 - today.getDay() + weekday) % 7 || 7));
  return result;
}

module.exports = parseFallback;
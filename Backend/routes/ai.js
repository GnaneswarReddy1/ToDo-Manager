const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const { casual } = require('chrono-node'); // ✅ Correct import

const router = express.Router();

router.post('/parse', auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "No text provided" });

  // ---------------------------
  // 1. CHRONO DATE/TIME PARSE
  // ---------------------------
  let dueDate = null;

  const parsed = casual.parse(text); // returns array of ParsingResults

  if (parsed.length > 0) {
    const dt = parsed[0].start;
    const jsDate = parsed[0].date();

    // Default time if not specified
    if (!dt.isCertain("hour")) {
      jsDate.setHours(9, 0, 0, 0); // 9 AM default
    } else {
      if (!dt.isCertain("minute")) {
        jsDate.setMinutes(0);
      }
    }

    // Convert to ISO string for frontend
    dueDate = jsDate.toISOString();
  }

  // ---------------------------
  // 2. AI CLEAN TITLE
  // ---------------------------
  let cleanTitle = "";

  const titlePrompt = `
Input: "${text}"

Return ONLY a very short task title (2–4 words).
Rules:
- DO NOT include dates or times.
- DO NOT repeat the full input.
- NO words: tomorrow, today, am, pm.
- Examples:
  "Doctor Appointment"
  "Submit Documents"
  "Team Meeting"
`;

  try {
    const aiResp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Short clean title generator" },
          { role: "user", content: titlePrompt }
        ],
        temperature: 0
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      }
    );

    cleanTitle = aiResp.data.choices[0].message.content.trim();

    // Extra cleanup
    cleanTitle = cleanTitle.replace(/tomorrow|today|pm|am/gi, "").trim();

    if (cleanTitle.split(" ").length > 5 || cleanTitle.length === 0) {
      cleanTitle = "Task";
    }
  } catch (err) {
    console.error("AI Title Error:", err.message);
    cleanTitle = "Task";
  }

  // ---------------------------
  // 3. SEND RESULT
  // ---------------------------
  res.json({
    title: cleanTitle,
    notes: text,
    dueDate,     // FULL ISO string
    priority: "medium",
    tags: []
  });
});

module.exports = router;

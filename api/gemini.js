// api/gemini.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
      { contents: messages },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from CleanSight AI.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API call failed" });
  }
}

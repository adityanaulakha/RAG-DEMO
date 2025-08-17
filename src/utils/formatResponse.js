// src/utils/formatResponse.js
export function formatResponse(text) {
  if (!text) return "";

  let formatted = text;

  // Add bold headings + emojis for sustainability concepts
  formatted = formatted.replace(/Recycle/gi, "♻️ <strong>Recycle</strong>");
  formatted = formatted.replace(/Reuse/gi, "🔄 <strong>Reuse</strong>");
  formatted = formatted.replace(/Reduce/gi, "📉 <strong>Reduce</strong>");
  formatted = formatted.replace(/Cleanliness/gi, "🧹 <strong>Cleanliness</strong>");
  formatted = formatted.replace(/Environment/gi, "🌍 <strong>Environment</strong>");
  formatted = formatted.replace(/Waste/gi, "🗑️ <strong>Waste</strong>");

  return formatted;
}

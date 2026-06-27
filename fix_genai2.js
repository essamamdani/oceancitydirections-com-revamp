const fs = require('fs');

let content = fs.readFileSync('src/lib/actions.js', 'utf8');

content = content.replace(/const ai = new GoogleGenAI\(\{\s*apiKey:\s*process\.env\.GOOGLE_GENERATIVE_AI_API_KEY\s*\}\);/g, "const { GoogleGenAI } = require('@google/genai');\n    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });");

// Wait, the top of the file has import { GoogleGenAI } from '@google/genai'.
// Since it's a Next.js environment, the ES module import at the top is fine.

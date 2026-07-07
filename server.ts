import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI with server-side API Key
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY environment variable is not defined.");
}

// AI Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  const { messages, userProfile } = req.body;

  if (!ai) {
    return res.status(503).json({ 
      error: "O serviço de IA está temporariamente indisponível. Por favor, verifique se a chave GEMINI_API_KEY está configurada no painel Configurações > Secrets." 
    });
  }

  try {
    // Format history for Gemini chat or list of contents
    // Let's use simple prompt with history context or generateContent
    const systemInstruction = `Você é o Vyn AI, o assistente de inteligência artificial pessoal do Vyntra (O Sistema Operacional da Sua Vida). 
Seu tom é motivador, inteligente, focado em desenvolvimento pessoal, produtividade, saúde e rotinas saudáveis. 
Responda de forma direta, clara e formatada de maneira bonita com markdown. 
O nome do usuário é: ${userProfile?.name || 'Membro do Vyntra'}. 
Ele mora em: ${userProfile?.location || 'Não especificado'} (Temperatura local: ${userProfile?.temperature || 'Não especificado'}). 
Dias ativos de consistência no Vyntra: ${userProfile?.streakDays || 0}.
Sempre responda em Português do Brasil de forma extremamente polida.`;

    // Map conversation history to Gemini structure
    const contents = (messages || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // If no contents, add default
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Olá!' }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/assistant endpoint:", error);
    res.status(500).json({ error: error.message || "Erro interno ao processar a requisição com Gemini" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production build from dist.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server with Vite:", err);
});

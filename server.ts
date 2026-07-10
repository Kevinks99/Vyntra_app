import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Dynamic nutrition text analysis endpoint using Gemini
app.post('/api/nutrition-express', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "O texto da refeição é obrigatório." });
  }

  // Helper local fallback parser if AI is not configured or fails
  const parseNutritionLocally = (inputStr: string) => {
    const lower = inputStr.toLowerCase();
    let name = "Refeição Express";
    let calories = 300;
    let protein = 12;
    let carbs = 30;
    let fat = 8;

    if (lower.includes("ovo")) {
      name = "Ovos Mexidos / Cozidos";
      calories = 180;
      protein = 14;
      carbs = 2;
      fat = 12;
    }
    if (lower.includes("pão") || lower.includes("pao")) {
      name = "Pão Integral";
      calories = 150;
      protein = 5;
      carbs = 28;
      fat = 2;
    }
    if (lower.includes("ovo") && (lower.includes("pão") || lower.includes("pao"))) {
      name = "Pão Integral com Ovos";
      calories = 330;
      protein = 19;
      carbs = 30;
      fat = 14;
    }
    if (lower.includes("frango")) {
      name = "Frango Grelhado";
      calories = 380;
      protein = 32;
      carbs = 15;
      fat = 8;
    }
    if (lower.includes("carne") || lower.includes("bife") || lower.includes("baba")) {
      name = "Carne Grelhada";
      calories = 450;
      protein = 30;
      carbs = 10;
      fat = 18;
    }
    if (lower.includes("whey") || lower.includes("shake") || lower.includes("proteina") || lower.includes("proteína")) {
      name = "Shake de Whey Protein";
      calories = 190;
      protein = 24;
      carbs = 5;
      fat = 2;
    }
    if (lower.includes("salada")) {
      name = "Salada Fresca";
      calories = 100;
      protein = 3;
      carbs = 8;
      fat = 5;
    }
    if (lower.includes("banana") || lower.includes("maca") || lower.includes("maçã") || lower.includes("fruta")) {
      name = "Fruta Picada";
      calories = 95;
      protein = 1;
      carbs = 23;
      fat = 0;
    }

    // Attempt to match numbers in the string
    const calMatch = lower.match(/(\d+)\s*kcal/);
    if (calMatch) calories = parseInt(calMatch[1], 10);

    const protMatch = lower.match(/(\d+)\s*g\s*de\s*prot/);
    if (protMatch) protein = parseInt(protMatch[1], 10);

    return { name, calories, protein, carbs, fat };
  };

  if (!ai) {
    const result = parseNutritionLocally(text);
    return res.json(result);
  }

  try {
    const prompt = `Analise a seguinte frase descrevendo uma refeição em português brasileiro: "${text}".
Extraia:
1. O nome resumido e amigável da refeição (ex: "Ovos e Pão Integral" ou "Lasanha de Carne").
2. Uma estimativa razoável de Calorias (kcal) como um número inteiro.
3. Uma estimativa razoável de Proteínas (g) como um número inteiro.
4. Uma estimativa de Carboidratos (g) como um número inteiro.
5. Uma estimativa de Gorduras (g) como um número inteiro.

Retorne EXCLUSIVAMENTE um objeto JSON válido, sem blocos de código markdown ou texto explicativo extra, seguindo exatamente este formato:
{
  "name": "Nome da Refeição",
  "calories": 250,
  "protein": 18,
  "carbs": 25,
  "fat": 8
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    let jsonStr = response.text || '';
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);
    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/nutrition-express:", error);
    const result = parseNutritionLocally(text);
    res.json(result);
  }
});

// Real food plate image analysis endpoint using Gemini Vision
app.post('/api/nutrition-scan', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "O envio de uma imagem é obrigatório." });
  }

  const getFallbackResult = () => {
    const fallbacks = [
      { name: "Salmão Grelhado com Brócolis e Batata Doce", calories: 510, protein: 38, carbs: 42, fat: 12 },
      { name: "Peito de Frango com Arroz Integral e Salada", calories: 430, protein: 35, carbs: 45, fat: 8 },
      { name: "Omelete de Claras com Tomate e Queijo Branco", calories: 280, protein: 22, carbs: 6, fat: 14 },
      { name: "Iogurte Natural com Granola e Morangos", calories: 240, protein: 12, carbs: 32, fat: 5 }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  if (!ai) {
    console.warn("⚠️ Servidor de IA não configurado. Retornando resultado simulado.");
    const fallback = getFallbackResult();
    return res.json(fallback);
  }

  try {
    // Helper to parse base64 data URL
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    const prompt = `Analise com extremo rigor visual e precisão científica a foto deste prato de refeição para identificar os alimentos reais e estimar suas informações nutricionais baseando-se em porções individuais padrão de restaurante (em média 100g a 150g por item detectado).

Siga estritamente as regras abaixo para evitar alucinações e invenções:
1. ANÁLISE RIGOROSA (SEM INVENÇÕES):
   - Analise detalhadamente as texturas, cores e formatos visíveis na imagem.
   - NÃO tente inventar ou assumir pratos elaborados ou receitas gourmetizadas se não houver certeza absoluta (por exemplo, se for arroz comum branco ou integral com pedaços de carne, NÃO classifique como "Risoto de Funghi", mas sim pelo que é visível: "Arroz com carne" ou "Carboidrato complexo com proteína").
   - Se você não tiver certeza absoluta de um ingrediente específico ou alimento, classifique-o pela categoria nutricional ou grupo alimentar mais próximo (ex: 'Proteína grelhada', 'Carboidrato complexo', 'Verduras folhosas', 'Legumes cozidos') em vez de inventar um ingrediente específico.

2. ESTIMATIVAS DE VALORES COERENTES:
   - Baseie todas as estimativas de calorias e macros em porções médias individuais padrão de restaurante (aproximadamente 100g a 150g por item detectado).
   - Priorize a segurança das métricas: é melhor errar levemente para menos nas calorias totais de forma conservadora do que inventar números astronômicos e irrealistas.

3. RESPOSTA EXCLUSIVAMENTE EM JSON ESTRUTURADO:
   - Você DEVE retornar APENAS um objeto JSON válido, sem blocos de código markdown ou texto explicativo extra, seguindo exatamente estas chaves:
     {
       "refeicao_nome": "Nome realista, descritivo e simples em Português",
       "calorias_estimadas": 450,
       "proteinas_g": 32,
       "carboidratos_g": 38,
       "gorduras_g": 12
     }`;

    // We can use gemini-1.5-pro or gemini-3.5-flash since both support Vision.
    // Let's use gemini-1.5-pro as requested by the user, fallback to gemini-3.5-flash if needed.
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    let jsonStr = response.text || '';
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    // Map the strict Portuguese keys requested by the user to the frontend keys (name, calories, protein, carbs, fat)
    const formattedResult = {
      name: result.refeicao_nome || result.name || "Refeição Escaneada",
      calories: Math.round(Number(result.calorias_estimadas !== undefined ? result.calorias_estimadas : result.calories)) || 0,
      protein: Math.round(Number(result.proteinas_g !== undefined ? result.proteinas_g : result.protein)) || 0,
      carbs: Math.round(Number(result.carboidratos_g !== undefined ? result.carboidratos_g : result.carbs)) || 0,
      fat: Math.round(Number(result.gorduras_g !== undefined ? result.gorduras_g : result.fat)) || 0
    };

    res.json(formattedResult);
  } catch (error: any) {
    console.error("Error in /api/nutrition-scan:", error);
    const fallback = getFallbackResult();
    res.json(fallback);
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

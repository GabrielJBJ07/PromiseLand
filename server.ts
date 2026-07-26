import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini AI Bible Tutor
  app.post('/api/gemini/tutor', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          reply: '말씀을 묵상하며 즐겁게 암송해보세요! (GEMINI_API_KEY가 설정되지 않았습니다)',
        });
      }

      const { prompt, verse } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `당신은 초등부(4학년~6학년) 학생들을 유쾌하고 따뜻하게 지도하는 성경 말씀 암송 튜터입니다.
말씀: [${verse?.reference || ''}] "${verse?.text || ''}"
요청: ${prompt}

규칙:
1. 초등학생 눈높이에 맞는 다정하고 쉬운 한국어로 답변하세요.
2. 3~4줄 이내로 핵심 의미와 암송 팁을 흥미롭게 설명하세요.
3. 이모지와 격려의 말을 사용하세요.`,
              },
            ],
          },
        ],
      });

      const replyText = response.text || '말씀을 즐겁게 묵상하고 외워봅시다!';
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Gemini API error:', error);
      res.json({
        reply: '말씀 암송에 도전하는 당신을 응원합니다! 차근차근 외워보아요. 🌟',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

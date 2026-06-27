import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for GoogleGenAI
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Helper to handle AI content generation with fallback on model overloading (503)
async function generateContentWithFallback(ai: GoogleGenAI, params: { model: string; contents: string; config?: any }) {
  const modelsToTry = [
    params.model,
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting generateContent using model: ${modelName}`);
      return await ai.models.generateContent({
        ...params,
        model: modelName
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} failed or unavailable:`, err.message || err);
    }
  }

  console.error("All attempted Gemini models failed / are currently experiencing high demand.");
  throw lastError;
}

// REST APIs
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI Product Recommendations Endpoint
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { currentProduct, cartItems, category } = req.body;
    const ai = getAI();

    let prompt = "You are a senior product merchandiser and recommender for NovaMart, an enterprise marketplace. ";
    if (currentProduct) {
      prompt += `The user is currently viewing the following product: "${currentProduct.name}" (Category: ${currentProduct.category}, Price: $${currentProduct.price}, Brand: ${currentProduct.brand}). Description: "${currentProduct.description}". `;
    }
    if (cartItems && cartItems.length > 0) {
      prompt += `The user's shopping cart contains: ${cartItems.map((item: any) => `${item.name} (qty: ${item.quantity})`).join(", ")}. `;
    }
    if (category) {
      prompt += `The category filter is set to: "${category}". `;
    }
    prompt += "Analyze these items and suggest exactly 3 creative product upsell ideas, cross-sell items, or descriptive styles. Keep the output concise, highly engaging, and in bullet points (limit to 3 bullet points, each under 15 words) with bold, snappy insights. Focus on matching values (e.g. fashion pairings, tech setups, or premium kitchen style). Do not output other text.";

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ recommendations: response.text || "Highly recommended pairings based on premium styles." });
  } catch (error: any) {
    console.error("AI recommendations error:", error);
    res.json({ recommendations: "✨ Personalized collections tailored for your taste are loading. Complete checkout for custom membership points!" });
  }
});

// AI Support Chatbot Endpoint
app.post("/api/ai/support", async (req, res) => {
  try {
    const { messages, currentProduct } = req.body;
    const ai = getAI();

    const formattedHistory = messages.map((m: any) => {
      const sender = m.sender === 'user' ? 'Customer' : 'NovaMart Assistant';
      return `${sender}: ${m.text}`;
    }).join("\n");

    let systemPrompt = "You are 'NovaMart Copilot', an elite customer support expert for an enterprise multi-vendor marketplace. " +
      "You are extremely professional, helpful, and concise. Your goal is to guide customers on order returns, refund policies, " +
      "applying coupon codes, and finding the perfect product. " +
      "NovaMart offers 2-day priority delivery, 30-day hassle-free returns, automatic GST invoice generation, and full buyer protection. " +
      "Keep responses to a maximum of 3 elegant sentences. " +
      "Context of active product being viewed:\n";

    if (currentProduct) {
      systemPrompt += `Product: "${currentProduct.name}" | Brand: ${currentProduct.brand} | Category: ${currentProduct.category} | Price: $${currentProduct.price} | Stock: ${currentProduct.stock > 0 ? "In Stock" : "Out of Stock"}.\n`;
    } else {
      systemPrompt += "None chosen yet.\n";
    }

    const prompt = `${systemPrompt}\nChat History so far:\n${formattedHistory}\nNovaMart Assistant (Please provide answer directly):`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ reply: response.text || "I'm happy to assist you with your orders, secure checkout, or vendor terms!" });
  } catch (error: any) {
    console.error("AI support error:", error);
    res.json({
      reply: "Hello! Our live server is currently simulating state, but I am here online. Feel free to use checkout, file returns, use discount coupons like SAVE10 or VIP20, or write verified seller reviews!"
    });
  }
});

// AI Review Moderation Endpoint
app.post("/api/ai/moderate-review", async (req, res) => {
  try {
    const { comment, rating } = req.body;
    if (!comment || comment.trim() === "") {
       return res.json({ approved: true, comment: "" });
    }
    const ai = getAI();
    const prompt = `You are an automated reviews moderator for NovaMart marketplace. We strictly prohibit offensive words, spam links, explicit content, or fake promotions. 
Rating given: ${rating}/5. Comment to review: "${comment}".
Analyze the comment. If it contains offensive language, threats, self-promotion URL links, or pure spam, rewrite it strictly into a constructive, polite neutral message (or clean up bad vocabulary), otherwise return the exact same comment. Your output must be a JSON object with two fields: "approved" (boolean) and "comment" (string). Output ONLY the JSON object, do not use markdown codeblock ticks.`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || JSON.stringify({ approved: true, comment }));
    res.json(parsed);
  } catch (error: any) {
    console.error("AI review moderation error:", error);
    res.json({ approved: true, comment: req.body?.comment || "" }); // Fallback to original text if fails
  }
});

// Vite Middleware Setup
async function initializeVite() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NovaMart Platform Server listening on http://0.0.0.0:${PORT}`);
  });
}

initializeVite().catch((err) => {
  console.error("Failed to start server:", err);
});

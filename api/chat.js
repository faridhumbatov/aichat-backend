export default async function handler(req, res) {
  // CORS ayarları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    // DOĞRU URL: Birbaşa modelin API nöqtəsi
    const API_URL = "https://router.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct";
    
    const response = await fetch(API_URL, {
      headers: { 
        Authorization: `Bearer ${process.env.HF_TOKEN}`, // Vercel-də HF_TOKEN olduğundan əmin olun
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: message,
        parameters: { 
          max_new_tokens: 500,
          return_full_text: false 
        },
        options: { 
          wait_for_model: true // Model yüklənirsə xəta vermə, gözlə
        }
      }),
    });

    // Əgər cavab JSON deyilsə tutaq
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        return res.status(500).json({ error: "API-dən qeyri-JSON cavab gəldi", details: text });
    }

    const data = await response.json();

    if (data.error) {
        return res.status(500).json({ error: "HF Xətası: " + data.error });
    }

    // Llama modelləri adətən massiv qaytarır
    const aiResponse = Array.isArray(data) ? data[0].generated_text : data.generated_text;

    return res.status(200).json({ reply: aiResponse || "Cavab boşdur" });

  } catch (error) {
    return res.status(500).json({ error: "Server daxili xətası: " + error.message });
  }
}

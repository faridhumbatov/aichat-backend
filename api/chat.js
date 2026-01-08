export default async function handler(req, res) {
  // 1. CORS İcazələri (Brauzer xətalarının qarşısını alır)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    // SEÇİLƏN MODEL: Qwen 2.5 (Çox güclüdür və lisenziya təsdiqi tələb etmir)
    // Bu URL standartdır və pulsuz hesablarla işləyir.
    const API_URL = "https://router.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct";
    
    const response = await fetch(API_URL, {
      headers: { 
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: message,
        parameters: { 
          max_new_tokens: 500, // Cavabın uzunluğu
          return_full_text: false 
        },
        options: { 
          wait_for_model: true // Model yatıbsa oyanmasını gözləyir
        }
      }),
    });

    // Əgər API xəta qaytarsa (məsələn 404 və ya 500)
    if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `API Xətası (${response.status}): ${errorText}` });
    }

    const data = await response.json();

    // Cavabı təmizləyib götürürük
    let aiReply = "";
    if (Array.isArray(data) && data[0].generated_text) {
        aiReply = data[0].generated_text;
    } else if (data.generated_text) {
        aiReply = data.generated_text;
    } else {
        aiReply = "Anlaşılmaz cavab alındı.";
    }

    // İstifadəçiyə cavabı göndəririk
    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    return res.status(500).json({ error: "Server kodu xətası: " + error.message });
  }
}


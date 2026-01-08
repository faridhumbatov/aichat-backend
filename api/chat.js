export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { message } = req.body;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct", {
      headers: { 
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        inputs: `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
        parameters: { max_new_tokens: 500, return_full_text: false },
        options: { wait_for_model: true } // Model yüklənməyibsə, gözləməsini təmin edir
      }),
    });

    const data = await response.json();
    console.log("HF Data:", data); // Vercel loglarında görmək üçün

    // Cavabın formatını yoxlayırıq
    let aiResponse = "";
    if (Array.isArray(data) && data[0].generated_text) {
      aiResponse = data[0].generated_text;
    } else if (data.error) {
      return res.status(500).json({ error: "HF Xətası: " + data.error });
    } else {
      return res.status(500).json({ error: "Gözlənilməyən cavab formatı", details: data });
    }

    return res.status(200).json({ reply: aiResponse });

  } catch (error) {
    return res.status(500).json({ error: "Server xətası: " + error.message });
  }
}

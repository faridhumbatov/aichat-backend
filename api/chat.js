// api/chat.js
export default async function handler(req, res) {
    // CORS icazələri (GitHub Pages-dən gələn sorğuları qəbul etmək üçün)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Təhlükəsizlik üçün '*' yerinə öz saytınızın linkini qoya bilərsiniz
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnız POST sorğuları qəbul edilir' });
    }

    const { message } = req.body;

    try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` // Açar Vercel-də saxlanacaq
            },
            body: JSON.stringify({
                model: "deepseek-chat", // Və ya "deepseek-coder"
                messages: [
                    { role: "system", content: "Sən faydalı bir köməkçisən." },
                    { role: "user", content: message }
                ],
                stream: false
            })
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: 'DeepSeek API xətası', details: error.message });
    }
}
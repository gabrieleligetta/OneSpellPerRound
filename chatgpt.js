const axios = require("axios");
async function prompt (richiesta) {
    if (!richiesta) {
        richiesta = "rispondimi solo con una battuta divertente su dungeons and dragons senza che sembri la risposta di un bot e in meno di 50 parole"
    }
    const apiKey = process.env.CHATGPT_API_KEY
    const data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": richiesta}],
        "temperature": 0.7
    };
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
        });
        return response.data.choices[0].message.content
    } catch (e) {
        console.log(e.response.status)
        console.log(e.response.statusText)
        console.log(e.response.data.error)
    }


}

module.exports = {prompt}


// Ponto único de integração do chat com a IA.
//
// Hoje: não há IA conectada. A função responde com uma mensagem fixa e honesta e oferece o WhatsApp,
// levando junto a mensagem que a pessoa digitou.
//
// Para integrar no futuro:
// 1. Crie uma rota no servidor (ex.: POST /api/chat em server.mjs) que chame o modelo de IA.
//    A chave da API fica só no servidor, nunca no navegador.
// 2. Troque o corpo de askAssistant por uma chamada a essa rota, por exemplo:
//      const response = await fetch('/api/chat', {
//        method: 'POST',
//        headers: { 'content-type': 'application/json' },
//        body: JSON.stringify({ unit: unit.id, messages }),
//      });
//      if (!response.ok) throw new Error('chat indisponível');
//      const data = await response.json();
//      return { text: data.reply };
// 3. Mude AI_ENABLED para true, para o chat deixar de exibir o aviso "IA em breve".

export const AI_ENABLED = false;

/**
 * @param {{ messages: { role: 'user' | 'assistant', text: string }[], unit: { id: string, name: string } }} input
 * @returns {Promise<{ text: string, offerWhatsApp?: boolean }>}
 */
export async function askAssistant({ messages, unit }) {
  void messages;
  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    text: `Recebi sua mensagem! As respostas automáticas com IA ainda estão sendo preparadas. Para falar agora com a equipe da ${unit.name}, envie sua dúvida pelo WhatsApp. A mensagem já vai preenchida.`,
    offerWhatsApp: true,
  };
}

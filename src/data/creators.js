// Creators que aparecem na faixa em movimento da seção "Parceria remunerada".
//
// Inclua apenas quem autorizou a divulgação do nome e do perfil.
// Enquanto a lista estiver vazia: em `npm run dev` aparece a prévia fictícia de creators.demo.js;
// na build de produção aparecem cartões "Exemplo de layout", sem nomes nem falas inventados.
// Depoimentos devem ser palavras reais do creator, com autorização para publicar.
//
// Formato de cada item:
// {
//   name: 'Nome do creator',
//   handle: '@perfil',
//   network: 'Instagram',            // nome de uma rede de social-networks.js; define a cor do cartão
//   pet: 'Nome do pet',               // opcional
//   unit: 'serra',                    // 'serra' ou 'mar'
//   profileUrl: 'https://www.instagram.com/perfil/',
//   avatar: 'https://...',            // opcional; sem foto, aparecem as iniciais
//   quote: 'Depoimento real, com autorização.', // opcional; com ele o cartão vira um depoimento
// }
export const creators = [];

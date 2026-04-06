export const EASTER_EGGS = {
  'uwu': '#ff61a6',
  'owo': '#ff8a5c',
  'sergio': '#0099ff',
  'sexo anal':'#009472',
  'sexoanal':'#009472',
  'birote':'#874f10ff',
  'tu eres mia me alejo mi vida en el espejo':'#39e7faff'
};

export function getEasterEggMarkedExtension() {
  const words = Object.keys(EASTER_EGGS);
  const regexString = `^\\b(${words.join('|')})\\b`;
  const regex = new RegExp(regexString, 'i');

  return {
    name: 'easterEgg',
    level: 'inline',
    start(src) {
      // Find the first index of ANY easter egg word that has a word boundary
      const globalRegex = new RegExp(`\\b(${words.join('|')})\\b`, 'i');
      const match = globalRegex.exec(src);
      return match ? match.index : undefined;
    },
    tokenizer(src, tokens) {
      const match = regex.exec(src);
      if (match) {
        return {
          type: 'easterEgg',
          raw: match[0],
          text: match[1] // The exact text matched (keeps case)
        };
      }
    },
    renderer(token) {
      const lowerKey = token.text.toLowerCase();
      const color = EASTER_EGGS[lowerKey];
      return `<strong class="easter-egg-match" style="color: ${color}; text-shadow: 0 0 8px ${color}55;">${token.text}</strong>`;
    }
  };
}

export function createLottoDraw(input = {}) {
  const pickCount = Number(input.pickCount || 6);
  const maxNumber = Number(input.maxNumber || 49);

  return {
    id: input.id || `lotto-${Date.now()}`,
    title: input.title || 'Lotto Draw',
    pickCount,
    maxNumber,
    ticketPrice: Number(input.ticketPrice || 0),
    status: input.status || 'draft',
    tickets: Array.isArray(input.tickets) ? [...input.tickets] : [],
    winningNumbers: Array.isArray(input.winningNumbers) ? [...input.winningNumbers] : [],
  };
}

export function drawLottoNumbers(draw, random = Math.random) {
  const pool = Array.from({ length: draw.maxNumber }, (_, index) => index + 1);
  const numbers = [];

  while (numbers.length < draw.pickCount && pool.length) {
    const index = Math.floor(random() * pool.length);
    numbers.push(pool.splice(index, 1)[0]);
  }

  return numbers.sort((a, b) => a - b);
}

export function scoreLottoTicket(ticketNumbers, winningNumbers) {
  const winning = new Set(winningNumbers);
  const matches = ticketNumbers.filter((number) => winning.has(number));

  return {
    matches,
    matchCount: matches.length,
    isWinner: matches.length === winningNumbers.length,
  };
}

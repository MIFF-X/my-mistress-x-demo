export function createRaffle(input = {}) {
  return {
    id: input.id || `raffle-${Date.now()}`,
    title: input.title || 'Raffle',
    prize: input.prize || 'Prize',
    ticketPrice: Number(input.ticketPrice || 0),
    status: input.status || 'draft',
    tickets: Array.isArray(input.tickets) ? [...input.tickets] : [],
  };
}

export function sellRaffleTicket(raffle, buyerId) {
  const ticketNumber = raffle.tickets.length + 1;
  const ticket = {
    id: `${raffle.id}-ticket-${ticketNumber}`,
    ticketNumber,
    buyerId,
  };

  return {
    raffle: {
      ...raffle,
      tickets: [...raffle.tickets, ticket],
    },
    ticket,
  };
}

export function drawRaffleWinner(raffle, random = Math.random) {
  if (!raffle.tickets.length) {
    return null;
  }

  return raffle.tickets[Math.floor(random() * raffle.tickets.length)];
}

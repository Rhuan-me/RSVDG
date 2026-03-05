import { UnoCard, UnoColor, UnoValue, WildType, GameState, Player } from '../types/uno';

const colors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
const values: UnoValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];

export function createDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  let id = 0;

  // Cartas normais e especiais (cada cor)
  colors.forEach(color => {
    // Um '0' por cor
    deck.push({ id: `${id++}`, color, value: '0' });
    
    // Duas cartas de cada valor (1-9 e especiais)
    values.slice(1).forEach(value => {
      deck.push({ id: `${id++}`, color, value });
      deck.push({ id: `${id++}`, color, value });
    });
  });

  // 4 Coringas normais
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `${id++}`, color: 'wild', value: 'wild' });
  }

  // 4 Coringas +4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `${id++}`, color: 'wild', value: 'wild+4' });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: UnoCard[]): UnoCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function initializeGame(playerNames: string[]): GameState {
  const deck = createDeck();
  const players: Player[] = playerNames.map(name => ({
    name,
    hand: [],
    handSize: 7,
  }));

  // Distribuir 7 cartas para cada jogador
  let cardIndex = 0;
  players.forEach(player => {
    player.hand = deck.slice(cardIndex, cardIndex + 7);
    cardIndex += 7;
  });

  // Carta inicial (não pode ser coringa)
  let firstCard = deck[cardIndex];
  while (firstCard.color === 'wild') {
    cardIndex++;
    firstCard = deck[cardIndex];
  }
  cardIndex++;

  const drawPile = deck.slice(cardIndex);
  const discardPile = [firstCard];

  return {
    players,
    currentPlayerIndex: 0,
    direction: 1,
    drawPile,
    discardPile,
    currentCard: firstCard,
    gameStatus: 'playing',
    mustDraw: 0,
    waitingForColorChoice: false,
  };
}

export function canPlayCard(card: UnoCard, currentCard: UnoCard): boolean {
  // Coringas podem ser jogados sempre
  if (card.color === 'wild') {
    return true;
  }

  // Mesma cor ou mesmo valor
  return card.color === currentCard.color || card.value === currentCard.value;
}

export function getNextPlayerIndex(
  currentIndex: number,
  direction: number,
  totalPlayers: number
): number {
  let nextIndex = currentIndex + direction;
  
  if (nextIndex >= totalPlayers) {
    nextIndex = 0;
  } else if (nextIndex < 0) {
    nextIndex = totalPlayers - 1;
  }
  
  return nextIndex;
}

export function playCard(
  gameState: GameState,
  cardIndex: number,
  chosenColor?: UnoColor
): GameState {
  const newState = { ...gameState };
  const currentPlayer = newState.players[newState.currentPlayerIndex];
  const card = currentPlayer.hand[cardIndex];

  // Remover carta da mão do jogador
  currentPlayer.hand = currentPlayer.hand.filter((_, i) => i !== cardIndex);
  
  // Adicionar à pilha de descarte
  newState.discardPile.push(card);
  
  // Atualizar carta atual
  let cardToSet = card;
  
  // Se for coringa e uma cor foi escolhida
  if (card.color === 'wild' && chosenColor) {
    cardToSet = { ...card, color: chosenColor };
    newState.waitingForColorChoice = false;
  }

  newState.currentCard = cardToSet;
  newState.lastAction = `${currentPlayer.name} jogou ${getCardName(card)}`;

  // Verificar vitória
  if (currentPlayer.hand.length === 0) {
    newState.gameStatus = 'finished';
    newState.winner = currentPlayer.name;
    return newState;
  }

  // Processar efeitos especiais
  let skipNext = false;

  switch (card.value) {
    case 'skip':
      skipNext = true;
      newState.lastAction += ' - Próximo jogador pulado!';
      break;
    
    case 'reverse':
      newState.direction = newState.direction === 1 ? -1 : 1;
      newState.lastAction += ' - Direção invertida!';
      if (newState.players.length === 2) {
        // Com 2 jogadores, reverse = skip
        skipNext = true;
      }
      break;
    
    case '+2':
      newState.mustDraw += 2;
      newState.lastAction += ' - Próximo jogador deve comprar 2!';
      break;
    
    case 'wild+4':
      newState.mustDraw += 4;
      newState.lastAction += ' - Próximo jogador deve comprar 4!';
      break;
  }

  // Avançar para o próximo jogador
  newState.currentPlayerIndex = getNextPlayerIndex(
    newState.currentPlayerIndex,
    newState.direction,
    newState.players.length
  );

  // Pular mais um se necessário
  if (skipNext) {
    newState.currentPlayerIndex = getNextPlayerIndex(
      newState.currentPlayerIndex,
      newState.direction,
      newState.players.length
    );
  }

  return newState;
}

export function drawCards(gameState: GameState, count: number): GameState {
  const newState = { ...gameState };
  const currentPlayer = newState.players[newState.currentPlayerIndex];

  // Se não há cartas suficientes, embaralhar descarte
  if (newState.drawPile.length < count) {
    const currentCard = newState.discardPile.pop()!;
    newState.drawPile = [...newState.drawPile, ...shuffleDeck(newState.discardPile)];
    newState.discardPile = [currentCard];
  }

  // Comprar cartas
  const drawnCards = newState.drawPile.splice(0, count);
  currentPlayer.hand.push(...drawnCards);

  newState.lastAction = `${currentPlayer.name} comprou ${count} carta${count > 1 ? 's' : ''}`;
  
  // Resetar contador de compra obrigatória
  newState.mustDraw = 0;

  // Passar a vez
  newState.currentPlayerIndex = getNextPlayerIndex(
    newState.currentPlayerIndex,
    newState.direction,
    newState.players.length
  );

  return newState;
}

export function getCardName(card: UnoCard): string {
  if (card.value === 'wild') return 'Coringa';
  if (card.value === 'wild+4') return 'Coringa +4';
  
  const colorNames = {
    red: 'Vermelho',
    blue: 'Azul',
    green: 'Verde',
    yellow: 'Amarelo',
  };

  const valueNames: Record<string, string> = {
    skip: 'Pular',
    reverse: 'Reverter',
    '+2': '+2',
  };

  const color = colorNames[card.color as UnoColor] || '';
  const value = valueNames[card.value] || card.value;

  return `${color} ${value}`;
}

export function simulateBotTurn(gameState: GameState): GameState {
  const botColors: UnoColor[] = ['red', 'blue', 'green', 'yellow'];
  let newState = { ...gameState };
  const currentPlayer = { ...newState.players[newState.currentPlayerIndex] };
  newState.players = newState.players.map((p, i) =>
    i === newState.currentPlayerIndex ? currentPlayer : p
  );

  // Encontrar cartas válidas
  const validCards = currentPlayer.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => canPlayCard(card, newState.currentCard));

  if (validCards.length > 0) {
    // Preferir cartas especiais se houver mustDraw pendente
    let chosen = validCards[0];
    if (newState.mustDraw > 0) {
      const stackable = validCards.find(({ card }) => card.value === '+2' || card.value === 'wild+4');
      if (stackable) chosen = stackable;
    }
    const { index, card } = chosen;

    // Se for coringa, escolher cor mais frequente na mão
    if (card.color === 'wild') {
      const colorCount: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
      currentPlayer.hand.forEach(c => {
        if (c.color !== 'wild') colorCount[c.color]++;
      });
      const bestColor = (Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0]?.[0] as UnoColor) ||
        botColors[Math.floor(Math.random() * botColors.length)];
      newState = playCard(newState, index, bestColor);
    } else {
      newState = playCard(newState, index);
    }
  } else if (newState.mustDraw > 0) {
    // Comprar cartas obrigatórias
    newState = drawCards(newState, newState.mustDraw);
  } else {
    // Comprar uma carta
    newState = drawCards(newState, 1);
  }

  return newState;
}
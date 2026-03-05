import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function RoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  
  // Estados com inicialização segura
  const [hand, setHand] = useState<any[]>([]);
  const [topCard, setTopCard] = useState<any>(null);
  const [status, setStatus] = useState({ turn: "Carregando...", isMyTurn: false });
  const [loading, setLoading] = useState(true);

  const fetchGameState = useCallback(async () => {
    const token = localStorage.getItem("token");
    // O seu back-end usa game_id, que no seu roteador é o roomCode
    const game_id = roomCode;

    if (!token || !game_id) return;

    try {
      // 1. Busca a Mão do Jogador
      const resHand = await fetch(`http://localhost:3000/api/games/my-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id })
      });
      const dataHand = await resHand.json();
      if (resHand.ok) setHand(dataHand.hand || []);

      // 2. Busca a Carta do Topo
      const resTop = await fetch(`http://localhost:3000/api/games/top-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id })
      });
      const dataTop = await resTop.json();
      if (resTop.ok && dataTop && !dataTop.error) {
        setTopCard(dataTop);
      }

      // 3. Busca o Turno Atual
      const resTurn = await fetch(`http://localhost:3000/api/games/current-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id })
      });
      const dataTurn = await resTurn.json();
      if (resTurn.ok && dataTurn) {
        setStatus({ 
          turn: dataTurn.username || "Desconhecido", 
          isMyTurn: dataTurn.isYourTurn || false 
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar mesa:", err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 3000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const handleDrawCard = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/games/draw-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id: roomCode })
      });
      fetchGameState();
    } catch (e) { console.error(e); }
  };

  const handlePlayCard = async (cardId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/games/play-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id: roomCode, card_id: cardId })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Você não pode jogar essa carta!");
      }
      fetchGameState();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div style={{...styles.board, justifyContent: 'center', alignItems: 'center', color: 'white'}}>Carregando partida...</div>;
  }

  return (
    <div style={styles.board}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/lobby')} style={styles.backBtn}>← Sair</button>
        <div style={styles.userBadge}>SALA: {roomCode}</div>
      </div>

      {/* Centro da Mesa */}
      <div style={styles.centerArea}>
        <div style={styles.pileGroup}>
          {/* Deck de Compra */}
          <div style={styles.pileContainer}>
            <span style={styles.pileLabel}>COMPRAR</span>
            <div style={styles.deckBack} onClick={handleDrawCard}>
              <div style={styles.cardInner}>UNO</div>
            </div>
          </div>

          {/* Carta do Descarte */}
          <div style={styles.pileContainer}>
            <span style={styles.pileLabel}>CARTA ATUAL</span>
            {topCard ? (
              <div style={{ ...styles.card, backgroundColor: topCard.color || '#333' }}>
                <span style={styles.cardNumber}>{topCard.value}</span>
              </div>
            ) : (
              <div style={{...styles.card, backgroundColor: '#555'}}>?</div>
            )}
          </div>

          {/* Painel de Turno */}
          <div style={styles.statusBox}>
            <span style={styles.statusLabel}>VEZ DE:</span>
            <p style={styles.turnText}>{status.turn}</p>
            {status.isMyTurn && <div style={styles.myTurnBadge}>SUA VEZ!</div>}
          </div>
        </div>
      </div>

      {/* Mão do Jogador */}
      <div style={styles.playerHandSection}>
        <div style={styles.handHeader}>
          <div style={styles.playerInfo}>
            <div style={styles.avatarCircle}>U</div>
            <span style={{fontWeight: 'bold'}}>Sua Mão</span>
            <span style={styles.cardCount}>{hand.length} cartas</span>
          </div>
        </div>

        <div style={styles.cardsScroll}>
          {hand.length > 0 ? hand.map((card, index) => (
            <div 
              key={card.id || index} 
              style={{ ...styles.cardInHand, backgroundColor: card.color || 'gray' }}
              onClick={() => handlePlayCard(card.id)}
            >
              <span style={styles.cardHandNumber}>{card.value}</span>
            </div>
          )) : (
            <p style={{color: '#999'}}>Nenhuma carta na mão.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  board: { height: '100vh', background: '#065f46', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', padding: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.1)' },
  backBtn: { background: '#ef4444', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  userBadge: { color: 'white', fontWeight: 'bold', letterSpacing: '1px' },
  centerArea: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  pileGroup: { display: 'flex', gap: '30px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '30px', borderRadius: '30px' },
  pileContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  pileLabel: { color: 'white', fontWeight: 'bold', fontSize: '12px', opacity: 0.8 },
  deckBack: { width: '90px', height: '130px', background: '#000', borderRadius: '10px', border: '3px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  cardInner: { color: 'white', fontWeight: 'bold', transform: 'rotate(-45deg)', fontSize: '20px' },
  card: { width: '90px', height: '130px', borderRadius: '10px', border: '3px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', color: 'white' },
  cardNumber: { fontSize: '40px', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' },
  statusBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statusLabel: { color: '#fcd34d', fontSize: '12px', fontWeight: 'bold' },
  turnText: { color: 'white', fontSize: '20px', fontWeight: 'bold', margin: '5px 0' },
  myTurnBadge: { background: '#fbbf24', color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: '900', fontSize: '12px', animation: 'pulse 1s infinite' },
  playerHandSection: { background: '#f8fafc', padding: '20px', minHeight: '200px', boxShadow: '0 -10px 20px rgba(0,0,0,0.2)' },
  handHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  playerInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatarCircle: { background: '#065f46', color: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  cardCount: { background: '#e2e8f0', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', color: '#475569' },
  cardsScroll: { display: 'flex', gap: '12px', overflowX: 'auto', padding: '10px 0' },
  cardInHand: { minWidth: '75px', height: '110px', borderRadius: '8px', border: '2px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: 'white', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' },
  cardHandNumber: { fontSize: '28px', fontWeight: 'bold' }
};
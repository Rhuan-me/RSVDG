import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function GamePage() {
  const params = useParams();
  const id = params.id || params.gameId || Object.values(params)[0];
  const navigate = useNavigate();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token || !id) return;

    try {
      // 1. Sincroniza Jogadores (POST /players)
      const resPlayers = await fetch(`http://localhost:3000/api/games/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id: id })
      });
      const dataPlayers = await resPlayers.json();
      if (resPlayers.ok) setPlayers(Array.isArray(dataPlayers) ? dataPlayers : []);

      // 2. VERIFICAÇÃO DE STATUS (GET /:id)
      const resStatus = await fetch(`http://localhost:3000/api/games/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resStatus.ok) {
        const gameData = await resStatus.json();
        
        // Tentamos encontrar o status em diferentes lugares do objeto
        const currentStatus = gameData?.status || gameData?.game?.status;
        
        // LOG PARA VOCÊ VER NO F12
        console.log("DEBUG - Status da sala:", currentStatus);

        if (currentStatus === 'playing' || currentStatus === 'started' || currentStatus === 'active') {
          console.log("DIRECIONANDO PARA A PARTIDA...");
          navigate(`/game/${id}/play`); 
        }
      }
    } catch (err) {
      console.error("Erro na sincronização:", err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchRoomData();
    const interval = setInterval(fetchRoomData, 2000); // Reduzi para 2s para ser mais rápido
    return () => clearInterval(interval);
  }, [fetchRoomData]);

  const handleToggleReady = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/games/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id: id })
      });
      fetchRoomData();
    } catch (err) {
      alert("Erro ao mudar status.");
    }
  };

  const handleStart = async () => {
    const token = localStorage.getItem("token");
    console.log("Solicitando início do jogo...");
    try {
      const response = await fetch(`http://localhost:3000/api/games/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ game_id: id })
      });

      if (response.ok) {
        console.log("Resposta do servidor: OK! Aguardando redirecionamento...");
        fetchRoomData(); // Força a verificação imediata
      } else {
        const error = await response.json();
        alert(error.error || "Faltam jogadores prontos ou você não é o dono.");
      }
    } catch (err) {
      alert("Erro de conexão");
    }
  };

  if (loading) return <div style={styles.container}><div style={styles.loader}>Sincronizando...</div></div>;

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h1 style={styles.title}>Lobby da Partida</h1>
        
        <div style={styles.infoBox}>
          <span style={styles.label}>CÓDIGO DA SALA</span>
          <div style={styles.idRow}>
            <span style={styles.idText}>{id}</span>
            <button onClick={() => { navigator.clipboard.writeText(id || ""); alert("Copiado!"); }} style={styles.copyButton}>COPIAR</button>
          </div>
        </div>

        <div style={styles.playerSection}>
          <h3 style={styles.sectionTitle}>Jogadores ({players.length}/4)</h3>
          <div style={styles.listContainer}>
            {players.map((p, index) => (
              <div key={index} style={styles.playerCard}>
                <div style={styles.playerInfo}>
                  <div style={styles.avatar}>👤</div>
                  <span style={styles.playerName}>{p.Player?.username || p.username || "Jogador"}</span>
                </div>
                <span style={p.isReady ? styles.statusReady : styles.statusWaiting}>
                  {p.isReady ? "PRONTO" : "AGUARDANDO"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleToggleReady} style={{...styles.mainButton, marginBottom: '15px', background: '#3b82f6'}}>
          ESTOU PRONTO / AGUARDAR
        </button>

        <button 
          onClick={handleStart} 
          style={{
            ...styles.mainButton,
            background: players.length >= 2 ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155'
          }}
          disabled={players.length < 2}
        >
          {players.length >= 2 ? 'INICIAR JOGO' : 'AGUARDANDO OPONENTE'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' },
  glassCard: { background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '28px', width: '100%', maxWidth: '420px', padding: '40px', textAlign: 'center' },
  title: { color: '#f8fafc', fontSize: '28px', fontWeight: '800', marginBottom: '30px' },
  infoBox: { background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', marginBottom: '30px' },
  label: { color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '8px' },
  idRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  idText: { color: '#38bdf8', fontSize: '22px', fontWeight: 'bold' },
  copyButton: { background: '#334155', border: 'none', color: '#f8fafc', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' },
  playerSection: { textAlign: 'left', marginBottom: '30px' },
  sectionTitle: { color: '#94a3b8', fontSize: '14px', marginBottom: '15px' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  playerCard: { background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  playerInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { fontSize: '20px' },
  playerName: { color: '#e2e8f0', fontWeight: '500' },
  statusReady: { color: '#4ade80', fontSize: '10px', fontWeight: 'bold', border: '1px solid #4ade80', padding: '2px 8px', borderRadius: '4px' },
  statusWaiting: { color: '#fbbf24', fontSize: '10px', fontWeight: 'bold', border: '1px solid #fbbf24', padding: '2px 8px', borderRadius: '4px' },
  mainButton: { width: '100%', padding: '16px', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  loader: { color: '#94a3b8', fontSize: '18px' }
};
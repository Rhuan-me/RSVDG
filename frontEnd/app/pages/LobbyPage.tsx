import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LobbyPage() {
  const [username, setUsername] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isEntering, setIsEntering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("unoUsername");
    if (!token) navigate("/");
    else setUsername(storedUsername || "Jogador");
  }, [navigate]);

  const handleCreateRoom = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch('http://localhost:3000/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: `Sala de ${username}` })
      });

      const data = await response.json();
      
      if (response.ok && data.game_id) {
        console.log("Indo para a sala:", data.game_id);
        navigate(`/game/${data.game_id}`);
      } else {
        alert(data.error || "Erro ao criar sala");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor!");
    }
  };

  // AJUSTE AQUI: Agora a função é assíncrona para registrar o Join no banco
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput) return;

    const token = localStorage.getItem("token");
    try {
      // 1. Registra a entrada no banco de dados primeiro
      const response = await fetch('http://localhost:3000/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ game_id: roomCodeInput })
      });

      if (response.ok) {
        // 2. Só navega se o join deu certo
        navigate(`/game/${roomCodeInput}`);
      } else {
        const data = await response.json();
        alert(data.error || "Código de sala inválido.");
      }
    } catch (err) {
      alert("Erro ao tentar entrar na sala.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <h1 style={styles.logoTitle}>UNO Lobby</h1>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} style={styles.logoutBtn}>Sair</button>
        </header>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={{...styles.iconCircle, backgroundColor: '#00a859'}}>+</div>
            <h2 style={styles.cardTitle}>Criar Sala</h2>
            <button onClick={handleCreateRoom} style={{...styles.actionBtn, backgroundColor: '#00a859'}}>CRIAR NOVA SALA</button>
          </div>

          <div style={styles.card}>
            <div style={{...styles.iconCircle, backgroundColor: '#3b59ff'}}>→</div>
            <h2 style={styles.cardTitle}>Entrar em Sala</h2>
            {isEntering ? (
              <form onSubmit={handleJoinRoom} style={{width:'100%'}}>
                <input 
                  placeholder="COLE O ID DA SALA AQUI" 
                  value={roomCodeInput} 
                  onChange={(e) => setRoomCodeInput(e.target.value)} 
                  style={styles.innerInput}
                />
                <button type="submit" style={{...styles.actionBtn, backgroundColor: '#3b59ff', marginTop: '10px'}}>ENTRAR</button>
              </form>
            ) : (
              <button onClick={() => setIsEntering(true)} style={{...styles.actionBtn, backgroundColor: '#3b59ff'}}>ENTRAR COM ID</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #ff4b2b 0%, #f7bb97 50%, #4facfe 100%)', padding: '40px 20px', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' },
  wrapper: { width: '100%', maxWidth: '900px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', color: 'white' },
  logoTitle: { fontSize: '48px', fontWeight: '900', margin: 0 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  card: { backgroundColor: 'white', borderRadius: '32px', padding: '40px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column', alignItems:'center' },
  iconCircle: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white', fontSize: '30px', fontWeight: 'bold' },
  cardTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '20px' },
  actionBtn: { width: '100%', padding: '15px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  innerInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ccc', boxSizing: 'border-box', textAlign: 'center' }
};
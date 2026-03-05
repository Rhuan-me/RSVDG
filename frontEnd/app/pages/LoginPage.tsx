import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert("Preencha os campos!");

    // CORREÇÃO DA ROTA: O seu loginRoutes.js define .post('/login')
    // Com o prefixo do app.js, o caminho correto é /api/auth/login
    const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/signup";
    
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password,
          ...(activeTab === "signup" && { email }) 
        }),
      });

      // Se a resposta for um erro (como o 404 que você estava recebendo)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return alert(`Erro: ${errorData.error || errorData.message || "Falha na comunicação com o servidor"}`);
      }

      const data = await response.json();

      if (activeTab === "login") {
        // Captura o token vindo do seu loginController/loginService
        const validToken = data.token || data.access_token || data.accessToken;

        if (validToken) {
          localStorage.setItem("token", validToken); 
          localStorage.setItem("unoUsername", data.username || username);
          console.log("Login realizado com sucesso! Token armazenado.");
          navigate("/lobby");
        } else {
          console.error("Token não encontrado na resposta do servidor:", data);
          alert("Erro: O servidor não enviou um token válido.");
        }
      } else {
        alert("Conta criada com sucesso! Agora você já pode entrar.");
        setActiveTab("login");
        setPassword("");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível conectar ao servidor. Verifique se o backend está ligado na porta 3000.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <div style={styles.logoInner}>
            <span style={styles.logoText}>UNO</span>
          </div>
        </div>

        <h1 style={styles.title}>Bem-vindo ao UNO!</h1>
        <p style={styles.subtitle}>Entre ou crie sua conta para começar a jogar</p>

        <div style={styles.tabContainer}>
          <div 
            onClick={() => setActiveTab("login")}
            style={{...styles.tab, 
              backgroundColor: activeTab === "login" ? "#fff" : "transparent",
              boxShadow: activeTab === "login" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              color: activeTab === "login" ? "#000" : "#888"
            }}
          >
            Entrar
          </div>
          <div 
            onClick={() => setActiveTab("signup")}
            style={{...styles.tab, 
              backgroundColor: activeTab === "signup" ? "#fff" : "transparent",
              boxShadow: activeTab === "signup" ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
              color: activeTab === "signup" ? "#000" : "#888"
            }}
          >
            Criar Conta
          </div>
        </div>

        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome de Usuário</label>
            <input 
              type="text" 
              placeholder={activeTab === "login" ? "Digite seu nome" : "Escolha um nome de usuário"}
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {activeTab === "signup" && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input 
                type="email" 
                placeholder="seu@email.com" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input 
              type="password" 
              placeholder={activeTab === "login" ? "Digite sua senha" : "Crie uma senha"}
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button, 
              background: activeTab === "login" 
                ? "linear-gradient(to right, #ed1c24, #f7941d, #fdb913)" 
                : "#00a859",
              boxShadow: activeTab === "login" 
                ? "0 12px 25px rgba(237, 28, 36, 0.3)" 
                : "0 12px 25px rgba(0, 168, 89, 0.2)"
            }}
          >
            {activeTab === "login" ? "ENTRAR" : "CRIAR CONTA"}
          </button>
        </form>

        <p style={styles.footerText}>
          {activeTab === "login" 
            ? "Use suas credenciais para acessar o lobby" 
            : "Ao criar conta, você aceita os termos do jogo"}
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff4b2b 0%, #ff416c 20%, #f7bb97 50%, #4facfe 80%, #00f2fe 100%)', fontFamily: 'sans-serif', padding: '40px 20px', boxSizing: 'border-box' },
  card: { position: 'relative', backgroundColor: 'white', width: '100%', maxWidth: '420px', padding: '85px 45px 40px 45px', borderRadius: '40px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', textAlign: 'center', marginTop: '40px' },
  logoContainer: { position: 'absolute', top: '-65px', left: '50%', transform: 'translateX(-50%)', width: '130px', height: '130px', backgroundColor: 'white', borderRadius: '50%', padding: '10px', boxShadow: '0 15px 30px rgba(0,0,0,0.15)' },
  logoInner: { width: '100%', height: '100%', background: 'linear-gradient(to top right, #ed1c24, #fdb913)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: 'white', fontSize: '42px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px' },
  title: { fontSize: '30px', fontWeight: '900', margin: '0 0 8px 0', color: '#1a1a1a' },
  subtitle: { fontSize: '15px', color: '#a0a0a0', marginBottom: '35px' },
  tabContainer: { display: 'flex', backgroundColor: '#f1f3f5', padding: '5px', borderRadius: '18px', marginBottom: '30px' },
  tab: { flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700', borderRadius: '14px', cursor: 'pointer', transition: '0.3s' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '8px', color: '#444' },
  input: { width: '100%', padding: '16px 20px', borderRadius: '16px', border: 'none', backgroundColor: '#f5f7f9', fontSize: '16px', boxSizing: 'border-box', outline: 'none' },
  button: { width: '100%', padding: '20px', borderRadius: '20px', border: 'none', color: 'white', fontSize: '18px', fontWeight: '900', cursor: 'pointer', marginTop: '10px', transition: '0.3s' },
  footerText: { fontSize: '11px', color: '#ccc', marginTop: '30px' }
};
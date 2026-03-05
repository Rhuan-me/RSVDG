const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Se não houver header, nem tenta processar
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Divide "Bearer TOKEN" e pega apenas a parte do TOKEN
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token error (Bearer missing)' });
  }

  const [scheme, token] = parts;

  // Verifica se a palavra Bearer está lá
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatted' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key';
    const decoded = jwt.verify(token, secret);
    
    // DEBUG: Veja exatamente o que tem dentro do token no console do VS Code
    console.log("CONTEÚDO DO TOKEN DECODIFICADO:", decoded);

    // Garante que o ID exista, não importa se veio como 'id', 'userId' ou dentro de 'user'
    const userId = decoded.id || (decoded.user && decoded.user.id) || decoded.userId;

    if (!userId) {
      throw new Error("Token não contém um ID de usuário válido.");
    }

    req.user = { id: userId }; 
    return next();
  } catch (err) {
    console.error("Erro JWT:", err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};






























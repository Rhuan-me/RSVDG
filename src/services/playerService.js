const Player = require('../models/player');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const playerRepository = require('../repository/PlayerRepository');
const PlayerResponseDTO = require('../DTO/Response/playerResponseDTO');
const Result = require('../utils/Result');

/**
 * @fileoverview Serviço de gerenciamento de jogadores implementado com Result Monad
 */
class PlayerService {
  
  /**
   * Valida regras de negócio para a senha
   */
  validatePassword(password) {
    if (!password || password.length < 6) {
      return Result.failure({
        message: 'A senha deve ter pelo menos 6 caracteres',
        code: 'VALIDATION_ERROR'
      });
    }
    return Result.success(password);
  }

  /**
   * Cria um novo jogador
   */
  async createPlayer(playerToSave) {
    const { email, password, username } = playerToSave;

    const passwordResult = this.validatePassword(password);
    if (passwordResult.isErr()) return passwordResult;

    try {
      if (await playerRepository.existsByEmail(email)) {
        return Result.failure({ 
          message: 'User already exists', 
          code: 'CONFLICT' 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const savedPlayer = await playerRepository.save({
        ...playerToSave,
        password: hashedPassword
      });

      return Result.success(new PlayerResponseDTO({ username, email }));
    } catch (error) {
      return Result.failure({ 
        message: 'Erro ao criar jogador no banco de dados', 
        details: error.message, 
        code: 'DATABASE_ERROR' 
      });
    }
  }

  /**
   * Autentica um jogador e gera um token JWT
   * AJUSTE: Retorno alterado para { token } para evitar erros de undefined no Frontend
   */
  async login(username, password) {
    try {
      const player = await Player.findOne({ where: { username } });

      if (!player || !(await bcrypt.compare(password, player.password))) {
        return Result.failure({ 
          message: 'Invalid credentials', 
          code: 'UNAUTHORIZED' 
        });
      }

      const token = jwt.sign(
        { id: player.id, username: player.username, email: player.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '3h' }
      );

      // MUDANÇA AQUI: de access_token para token
      return Result.success({ 
        token: token, 
        username: player.username 
      });
    } catch (error) {
      return Result.failure({ 
        message: 'Erro durante o processo de autenticação', 
        details: error.message, 
        code: 'AUTH_ERROR' 
      });
    }
  }

  /**
   * Obtém o perfil do jogador a partir de um token
   */
  async getProfile(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
      const playerResult = await this.getPlayerById(decoded.id);
      
      return playerResult.map(dto => ({
        username: dto.username,
        email: dto.email
      }));
    } catch (error) {
      return Result.failure({ 
        message: 'Invalid token', 
        code: 'UNAUTHORIZED' 
      });
    }
  }

  async getPlayerById(id) {
    try {
      const player = await playerRepository.findById(id);
      if (!player) {
        return Result.failure({ 
          message: 'Jogador não encontrado', 
          id: id, 
          code: 'NOT_FOUND' 
        });
      }
      return Result.success(new PlayerResponseDTO(player));
    } catch (error) {
      return Result.failure({ 
        message: 'Erro ao buscar jogador', 
        details: error.message, 
        code: 'DATABASE_ERROR' 
      });
    }
  }

  async updatePlayer(id, data) {
    const playerResult = await this.getPlayerById(id);
    return playerResult.flatMap(async () => {
      try {
        if (data.password) {
          const passValid = this.validatePassword(data.password);
          if (passValid.isErr()) return passValid;
          data.password = await bcrypt.hash(data.password, 10);
        }
        await playerRepository.update(id, data);
        return Result.success(new PlayerResponseDTO({ username: data.username, email: data.email }));
      } catch (error) {
        return Result.failure({ 
          message: 'Erro ao atualizar dados do jogador', 
          details: error.message, 
          code: 'DATABASE_ERROR' 
        });
      }
    });
  }

  async deletePlayer(id) {
    const playerResult = await this.getPlayerById(id);
    return playerResult.flatMap(async () => {
      try {
        await playerRepository.deleteById(id);
        return Result.success({ 
          message: 'Jogador removido com sucesso',
          id: id 
        });
      } catch (error) {
        return Result.failure({ 
          message: 'Erro ao remover jogador', 
          details: error.message, 
          code: 'DATABASE_ERROR' 
        });
      }
    });
  }

  async getAllPlayers() {
    const players = await Player.findAll({
      attributes: ['id', 'username', 'email', 'createdAt']
    });
    return players;
  }
}

module.exports = new PlayerService();
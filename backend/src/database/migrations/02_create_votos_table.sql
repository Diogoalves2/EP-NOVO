-- Criação da tabela de votos
CREATE TABLE IF NOT EXISTS votos (
  id SERIAL PRIMARY KEY,
  projeto_id INTEGER NOT NULL,
  vereador_id INTEGER NOT NULL,
  tipo_voto VARCHAR(10) NOT NULL CHECK (tipo_voto IN ('sim', 'nao', 'abster')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (vereador_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (projeto_id, vereador_id) -- Garante que um vereador só pode votar uma vez por projeto
); 
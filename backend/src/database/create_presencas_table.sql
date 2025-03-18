CREATE TABLE IF NOT EXISTS presencas (
  id SERIAL PRIMARY KEY,
  sessao_id INTEGER NOT NULL,
  vereador_id INTEGER NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT FALSE,
  hora_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sessao_id, vereador_id)
);

-- Criar índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_presencas_sessao_id ON presencas(sessao_id);
CREATE INDEX IF NOT EXISTS idx_presencas_vereador_id ON presencas(vereador_id);
CREATE INDEX IF NOT EXISTS idx_presencas_presente ON presencas(presente);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_presencas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at automaticamente
CREATE TRIGGER update_presencas_updated_at
BEFORE UPDATE ON presencas
FOR EACH ROW
EXECUTE FUNCTION update_presencas_updated_at(); 
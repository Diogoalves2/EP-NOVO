CREATE TABLE IF NOT EXISTS sessoes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('agendada', 'em_andamento', 'finalizada', 'cancelada')) DEFAULT 'agendada',
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'ordinaria',
    'extraordinaria',
    'solene',
    'secreta',
    'instalacao_legislatura',
    'comunitaria'
  )) DEFAULT 'ordinaria',
  camara_id INTEGER NOT NULL REFERENCES camaras(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 
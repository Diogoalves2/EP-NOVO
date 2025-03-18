-- Verificando se a coluna vereador_id existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'votos' AND column_name = 'vereador_id'
    ) THEN
        -- Adiciona a coluna vereador_id se ela não existir
        ALTER TABLE votos ADD COLUMN vereador_id INTEGER NOT NULL;
        
        -- Adiciona a restrição de chave estrangeira
        ALTER TABLE votos ADD CONSTRAINT fk_votos_vereador 
        FOREIGN KEY (vereador_id) REFERENCES users(id) ON DELETE CASCADE;
        
        -- Adiciona a restrição de unicidade
        ALTER TABLE votos DROP CONSTRAINT IF EXISTS votos_projeto_id_vereador_id_key;
        ALTER TABLE votos ADD CONSTRAINT votos_projeto_id_vereador_id_key 
        UNIQUE (projeto_id, vereador_id);
    END IF;
END
$$; 
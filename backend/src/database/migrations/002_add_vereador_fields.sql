DO $$
BEGIN
    -- Adiciona coluna partido se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'partido') THEN
        ALTER TABLE users ADD COLUMN partido VARCHAR(100);
    END IF;

    -- Adiciona coluna cargo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'cargo') THEN
        ALTER TABLE users ADD COLUMN cargo VARCHAR(100);
    END IF;

    -- Adiciona coluna foto se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'foto') THEN
        ALTER TABLE users ADD COLUMN foto VARCHAR(255);
    END IF;

    -- Adiciona coluna camara_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'camara_id') THEN
        ALTER TABLE users ADD COLUMN camara_id INTEGER REFERENCES camaras(id) ON DELETE CASCADE;
    END IF;
END $$; 
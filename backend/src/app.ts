import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Configurar o diretório de uploads como estático
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas da API
app.use('/api', router);

export default app; 
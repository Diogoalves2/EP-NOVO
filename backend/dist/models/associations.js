"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAssociations = void 0;
const initializeAssociations = () => {
    // Relacionamentos Sessao-Camara
    Sessao_1.Sessao.belongsTo(Camara_1.Camara, {
        foreignKey: 'camara_id',
        as: 'camara',
    });
    Camara_1.Camara.hasMany(Sessao_1.Sessao, {
        foreignKey: 'camara_id',
        as: 'sessoes',
    });
};
exports.initializeAssociations = initializeAssociations;

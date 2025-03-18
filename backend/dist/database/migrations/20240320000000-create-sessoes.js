"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sessoes', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        titulo: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        descricao: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        data: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('agendada', 'em_andamento', 'finalizada', 'cancelada'),
            allowNull: false,
            defaultValue: 'agendada',
        },
        tipo: {
            type: Sequelize.ENUM('ordinaria', 'extraordinaria'),
            allowNull: false,
            defaultValue: 'ordinaria',
        },
        camara_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'camaras',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    });
};
exports.up = up;
const down = async (queryInterface) => {
    await queryInterface.dropTable('sessoes');
};
exports.down = down;

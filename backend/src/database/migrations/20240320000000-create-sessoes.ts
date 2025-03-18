import { Migration } from '../types/migration';

export const up: Migration = async (queryInterface, Sequelize) => {
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

export const down: Migration = async (queryInterface) => {
  await queryInterface.dropTable('sessoes');
}; 
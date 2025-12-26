import Sequelize from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './backend/database.sqlite',
  logging: false
});

async function initDb() {
  await sequelize.sync({ alter: true });
  console.log('Database SQLite pronto');
}

export { sequelize, initDb };

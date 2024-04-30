import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

export const User = sequelize.define("user", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  master: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export const Company = sequelize.define("company", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matriz: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  executor: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export const Process = sequelize.define("process", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const File = sequelize.define("file", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blob: {
    type: DataTypes.BLOB("long"),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const Perm = sequelize.define("perm", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

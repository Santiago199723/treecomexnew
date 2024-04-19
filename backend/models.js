import { DataTypes, Op } from "sequelize";
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

export const Company = sequelize.define('company', {
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
  regUser: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

export const File = sequelize.define("file", {
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stageNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileBlob: {
    type: DataTypes.BLOB("long"),
    allowNull: false,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploadBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
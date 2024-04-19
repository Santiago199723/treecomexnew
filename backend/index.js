import fs from "fs";
import ora from "ora";
import cors from "cors";
import express from "express";
import { Op } from "sequelize";
import bodyParser from "body-parser";

import { sequelize } from "./database.js";
import { Company, User, File } from "./models.js";

const app = express();
const k = ora("Initializing...");

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413 && "body" in err) {
    return res.status(413).json({
      error: "PayloadTooLargeError",
      message: "O arquivo enviado é muito grande",
    });
  }
  next();
});

app.post("/register", async (req, res) => {
  const { email, password, master } = req.body;

  try {
    const newUser = await User.create({
      email: email,
      password: password,
      master: master,
    });

    return res.status(200).json({
      message: "Usuário criado com sucesso",
      userId: newUser.id,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        code: "EMAIL_REGISTERED",
        message: "O e-mail já está registrado",
      });
    }

    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro interno do servidor",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(404)
        .json({ code: "USER_NOT_FOUND", message: "Usuário não encontrado" });
    }

    if (user.password !== password) {
      return res
        .status(401)
        .json({ code: "INVALID_PASSWORD", message: "Senha inválida" });
    }

    return res
      .status(200)
      .json({ message: "Login bem-sucedido", userId: user.id });
  } catch (error) {
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro interno do servidor",
    });
  }
});

app.post("/company-register", async (req, res) => {
  const { ownerName, companyName, cpf, cnpj, country, matriz, userId } =
    req.body;

  if (!ownerName || !companyName || !country) {
    return res.status(400).json({
      code: "MISSING_FIELDS",
      message:
        "Todos os campos são obrigatórios, exceto CPF e CNPJ (pelo menos um deles deve ser fornecido)",
    });
  }

  if (!cpf && !cnpj) {
    return res.status(400).json({
      code: "MISSING_FIELDS",
      message: "Você deve fornecer pelo menos um CPF ou CNPJ",
    });
  }

  try {
    const existingCPFCompany = cpf
      ? await Company.findOne({ where: { cpf: cpf } })
      : null;
    if (existingCPFCompany) {
      return res.status(409).json({
        code: "CPF_REGISTERED",
        message: "CPF já registrado para outra empresa",
      });
    }

    const existingCNPJCompany = cnpj
      ? await Company.findOne({ where: { cnpj: cnpj } })
      : null;
    if (existingCNPJCompany) {
      return res.status(409).json({
        code: "CNPJ_REGISTERED",
        message: "CNPJ já registrado para outra empresa",
      });
    }

    if (userId) {
      const user = await User.findOne({ where: { id: userId } });
      if (user && !user.master) {
        const company = await Company.findOne({ where: { regUser: user.id } });
        if (company) {
          return res.status(403).json({
            code: "REQUEST_BLOCKED_NORMAL_USER",
            message: "Usuário não tem permissão para registrar mais empresas",
          });
        }
      }
    }

    await Company.create({
      ownerName: ownerName,
      companyName: companyName,
      cpf: cpf,
      cnpj: cnpj,
      country: country,
      matriz: matriz,
      regUser: userId,
    });

    return res.status(200).json({
      message: "Registro bem-sucedido",
    });
  } catch (error) {
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro interno do servidor",
    });
  }
});

app.post("/company-data", async (req, res) => {
  const { userId, company } = req.body;

  if (userId) {
    const user = await User.findOne({ where: { id: userId } });
    if (user && !user.master) {
      const companyOwned = await Company.findOne({
        where: { regUser: user.id },
      });
      if (!companyOwned || companyOwned.regUser !== user.id) {
        return res.status(403).json({
          code: "REQUEST_BLOCKED_NORMAL_USER",
          message: "Usuário não tem permissão para acessar dados desta empresa",
        });
      }
    }

    const result = await Company.findOne({
      where: {
        [Op.or]: [{ cpf: company }, { cnpj: company }],
      },
    });

    if (!result) {
      return res.status(404).json({
        code: "DATA_NOT_FOUND",
        message: "Não foram encontrados dados para o CPF ou CNPJ fornecido",
      });
    }

    return res.status(200).json(result);
  } else {
    return res.status(400).json({
      code: "MISSING_UUID",
      message: "UUID do usuário não fornecido",
    });
  }
});

app.post("/upload-file", async (req, res) => {
  try {
    const {
      company,
      optionType,
      stageNumber,
      uploadBy,
      fileName,
      fileBlob,
      mimeType,
    } = req.body;

    await File.create({
      company: company,
      optionType: optionType,
      stageNumber: stageNumber,
      fileName: fileName,
      fileBlob: fileBlob,
      mimeType: mimeType,
      uploadBy: uploadBy,
    });

    res.status(200).send({ message: "Arquivo enviado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao carregar o arquivo" });
  }
});

app.post("/file-list", async (req, res) => {
  try {
    const { company, stageNumber, optionType } = req.body;

    const files = await File.findAll({
      where: {
        company: company,
        stageNumber: stageNumber,
        optionType: optionType,
      },
    });

    res.status(200).send({ files: files });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Erro ao obter arquivo de arquivos" });
  }
});

const port = process.env.PORT || 8080;

sequelize.sync().then(function () {
  app.listen(port, () => {
    k.succeed(`Server is running on port ${port}`);
  });
});

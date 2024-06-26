import fs from "fs";
import ora from "ora";
import cors from "cors";
import path from "path";
import multer from "multer";
import mime from "mime-types";
import express from "express";
import { Op } from "sequelize";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { Actions, UserType } from "./enums.js";
import { sendRecoveryEmail } from "./smtp.js";
import { redis, sequelize } from "./database.js";
import { Company, User, Perm, Process, Admin, File } from "./models.js";
import { isUUID } from "./utils.js";

const app = express();
const k = ora("Initializing...");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const filesDir = path.join(__dirname, "..", "container", "files");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (request, file, callback) {
      callback(null, filesDir);
    },
    filename: function (request, file, callback) {
      callback(null, file.originalname);
    },
  }),
});

app.use((err, _, res, next) => {
  if (err instanceof SyntaxError && err.status === 413 && "body" in err) {
    return res.status(413).json({
      error: "PayloadTooLargeError",
      message: "O arquivo enviado é muito grande",
    });
  }
  next();
});

app.use("/", express.static(path.join(__dirname, "..", "public")));

app.post("/check-session", (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).send();
  }

  return res.status(200).send();
});

app.post("/register", async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const newUser = await User.create({
      email: email,
      password: password,
      userType: userType,
    });

    return res.status(200).json({
      message: "Usuário criado com sucesso!",
      user: newUser.id,
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
    const admin = await Admin.findOne({ where: { email: email } });

    if (!user && !admin) {
      return res
        .status(404)
        .json({ code: "NOT_FOUND", message: "Usuário não encontrado" });
    }

    const data = user ?? admin;

    if (data.password !== password) {
      return res
        .status(401)
        .json({ code: "INVALID_PASSWORD", message: "Senha inválida" });
    }

    if (
      (data.userType && data.userType === UserType.MASTER) ||
      data.userType === UserType.FINANCIAL
    ) {
      return res
        .status(200)
        .cookie("userId", data.id, {
          maxAge: 86400000,
          httpOnly: true,
          sameSite: "strict",
        })
        .json({
          message: "Login bem-sucedido",
          userType: data.userType,
        });
    }

    if (data.userType && data.userType === UserType.NORMAL) {
      const company = await Company.findOne({ where: { ofUser: data.id } });
      if (company) {
        return res
          .status(200)
          .cookie("userId", data.id, {
            maxAge: 86400000,
            httpOnly: true,
            sameSite: "strict",
          })
          .json({
            message: "Login bem-sucedido",
            company: company,
            userType: data.userType,
          });
      } else {
        return res.status(404).json({
          message:
            "Usuário não possui cadastro de empresa. Entre em contato com o suporte!",
        });
      }
    }

    return res
      .status(200)
      .cookie("userId", data.id, {
        maxAge: 86400000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: "Bem-vindo(a), administrador(a)!",
        userType: UserType.ADMIN,
      });
  } catch (error) {
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro interno do servidor",
    });
  }
});

app.post("/company/register", async (req, res) => {
  try {
    const { ownerName, companyName, cnpj, country, matriz, ofUser } = req.body;

    if (!ownerName || !companyName || !country) {
      return res.status(400).json({
        code: "MISSING_FIELDS",
        message: "Todos os campos são obrigatórios",
      });
    }

    const existingCompany = await Company.findOne({ where: { cnpj } });
    if (existingCompany) {
      existingCompany.ownerName = ownerName;
      existingCompany.companyName = companyName;
      existingCompany.country = country;
      existingCompany.matriz = matriz;

      await existingCompany.save();

      return res.status(200).json({
        message: "Empresa atualizada com sucesso",
      });
    }

    let userRegId = null;
    if (typeof ofUser === "string" && ofUser.includes("@")) {
      const userReg = await User.findOne({ where: { email: ofUser } });
      if (!userReg) {
        return res.status(404).json({
          code: "USER_NOT_FOUND",
          message: "Usuário não encontrado",
        });
      } else {
        userRegId = userReg.id;
      }
    } else if (isUUID(ofUser)) {
      userRegId = ofUser;
    } else {
      return res.status(400).json({
        message: "O valor deve ser um e-mail válido ou uuid",
      });
    }

    await Company.create({
      ownerName,
      companyName,
      cnpj,
      country,
      matriz,
      registrant: req.cookies.userId,
      ofUser: userRegId,
    });

    return res.status(200).json({
      message: "Registro bem-sucedido",
    });
  } catch (_) {
    return res.status(500).json({
      code: "SERVER_ERROR",
      message: "Ocorreu um erro interno do servidor",
    });
  }
});

app.get("/company/data", async (req, res) => {
  const userId = req.cookies.userId;
  const { unique } = req.query;

  if (userId) {
    const user = await User.findOne({ where: { id: userId } });
    if (user && user.userType === UserType.NORMAL) {
      const own = await Company.findOne({
        where: { ofUser: user.id },
      });

      if (!own || own.ofUser !== user.id) {
        return res.status(403).json({
          code: "REQUEST_BLOCKED_NORMAL_USER",
          message: "Usuário não tem permissão para acessar dados desta empresa",
        });
      }
    }

    const result = await Company.findOne({
      where: {
        cnpj: unique,
      },
    });

    if (!result) {
      return res.status(404).json({
        code: "DATA_NOT_FOUND",
        message: "Não foram encontrados dados para o CNPJ fornecido",
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

app.post("/company/remove", async (req, res) => {
  const { code } = req.body;
  const userId = req.cookies.userId;

  const admin = await Admin.findOne({
    where: {
      id: userId,
    },
  });

  if (admin) {
    const result = await Company.findOne({
      where: {
        cnpj: code,
      },
    });

    if (result) {
      await result.destroy();
      return res.status(200).json({
        message: "Empresa excluída com sucesso",
      });
    }

    return res.status(404).json({ message: "Empresa não encontrada" });
  }

  return res.status(403).json({ message: "Acesso não autorizado" });
});

app.get("/companies", async (req, res) => {
  const { userId } = req.cookies;
  if (!userId) {
    return res.redirect("/index.html");
  }

  const admin = await Admin.findOne({
    where: {
      id: userId,
    },
  });

  const user = await User.findOne({
    where: {
      id: userId,
    },
  });

  if ((!admin && !user) || (user && user.userType !== UserType.MASTER)) {
    return res.redirect("/index.html");
  }

  const companies = await Company.findAll();

  const companyData = companies.map((c) => ({
    id: c.cnpj,
    name: c.companyName,
    type: c.matriz ? "matriz" : "filial",
  }));

  return res.status(200).json(companyData);
});

app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    const file = await File.create({
      name: req.file.filename,
    });

    res
      .status(200)
      .send({ message: "Arquivo enviado com sucesso", fileId: file.id });
  } catch (_) {
    res.status(500).send({ message: "Erro ao carregar o arquivo" });
  }
});

app.get("/file/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const file = await File.findOne({
      where: {
        id: id,
      },
    });

    const filePath = path.join(filesDir, file.name);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(404).send({ message: "Arquivo não encontrado" });
      }

      res.setHeader("Content-Disposition", "attachment; filename=" + file.name);
      res.setHeader(
        "Content-Type",
        mime.lookup(file.name) || "application/octet-stream",
      );
      res.send(data);
    });
  } catch (err) {
    res.status(500).send({ message: "Erro ao obter arquivo" });
  }
});

app.get("/stage", async (req, res) => {
  const { company, stage, option, processId } = req.query;
  const results = await Perm.findAll({
    where: {
      company: company,
      action: {
        [Op.in]: [Actions.REMOVED_FILE, Actions.UPLOADED_FILE],
      },
    },
  });

  if (results) {
    const data = [];

    for (const result of results) {
      const value = new Map();
      const permData = JSON.parse(result.data);

      if (
        permData.stageNumber === Number(stage) &&
        permData.optionType === option
      ) {
        const user = await User.findOne({
          where: {
            id: permData.triggeredUser,
          },
        });

        const admin = await Admin.findOne({
          where: {
            id: permData.triggeredUser,
          },
        });

        if (!user && !admin)
          return res.status(404).send({ code: "MISSING_USER" });

        if (Number(stage) === 1) {
          if (result.action === Actions.UPLOADED_FILE) {
            value.set("attachedDate", result.createdAt);
            value.set("attachedBy", (user || admin).email);
            value.set("type", 1);
          } else {
            value.set("removedDate", result.createdAt);
            value.set("removedBy", (user || admin).email);
            value.set("type", 2);
          }
        } else if (
          Number(stage) !== 1 &&
          permData.processId &&
          permData.processId === processId
        ) {
          if (result.action === Actions.UPLOADED_FILE) {
            value.set("attachedDate", result.createdAt);
            value.set("attachedBy", (user || admin).email);
            value.set("type", 1);
          } else {
            value.set("removedDate", result.createdAt);
            value.set("removedBy", (user || admin).email);
            value.set("type", 2);
          }
        }

        if (value.size !== 0) {
          value.set("fileId", permData.fileId);
          data.push(Object.fromEntries(value));
        }
      }
    }

    return res.status(200).send(data);
  }
});

app.post("/sniff", async (req, res) => {
  try {
    const { userId } = req.cookies;
    const { action, company, data } = req.body;

    if (!userId) {
      return res.redirect("/index.html");
    }

    data.triggeredUser = userId;

    await Perm.create({
      action: action,
      data: JSON.stringify(data),
      company: company,
    });

    res.status(200).send({ message: "sniffed" });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

app.post("/process", async (req, res) => {
  const { id, company, client, forecast } = req.body;

  try {
    const existingProcess = await Process.findOne({ where: { id } });
    if (existingProcess) {
      existingProcess.id = id;
      existingProcess.company = company;
      existingProcess.client = client;
      existingProcess.forecast = forecast;

      await existingProcess.save();
      return res.status(200).json({ message: "Processo editado com sucesso" });
    }

    await Process.create({
      id: id,
      company: company,
      client: client,
      forecast: forecast,
    });

    return res.status(201).send({ message: "Registrado com sucesso" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar o processo" });
  }
});

app.get("/process", async (req, res) => {
  try {
    let processes = [];
    const { company } = req.query;
    const { userId } = req.cookies;

    if (userId && !company) {
      const admin = await Admin.findOne({
        where: {
          id: userId,
        },
      });

      if (admin) {
        processes = await Process.findAll();
      }

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (user && user.userType === UserType.FINANCIAL) {
        processes = await Process.findAll();
      }
    } else if (company) {
      processes = await Process.findAll({
        where: {
          company: company,
        },
      });
    } else {
      return res.status(400).json({ error: "Parâmetro 'company' ausente" });
    }

    const processIds = processes.map((process) => process.id);

    return res.status(200).json(processIds);
  } catch (_) {
    return res
      .status(500)
      .json({ error: "Erro ao obter os IDs dos processos" });
  }
});

app.get("/process/data", async (req, res) => {
  try {
    const { id } = req.query;
    const { userId } = req.cookies;

    if (!userId) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const admin = await Admin.findOne({
      where: {
        id: userId,
      },
    });

    if (!admin) {
      return res.status(403).json({ error: "Proibido" });
    }

    const data = await Process.findOne({
      where: {
        id: id,
      },
    });

    if (!data) {
      return res.status(404).json({ error: "Dados não encontrados" });
    }

    return res.status(200).json({ data: data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/process/remove", async (req, res) => {
  const { id } = req.body;
  const userId = req.cookies.userId;

  const admin = await Admin.findOne({
    where: {
      id: userId,
    },
  });

  if (admin) {
    const result = await Process.findOne({
      where: {
        id: id,
      },
    });

    if (result) {
      await result.destroy();
      return res.status(200).json({
        message: "Processo excluído com sucesso",
      });
    }

    return res.status(404).json({ message: "Processo não encontrado" });
  }

  return res.status(403).json({ message: "Acesso não autorizado" });
});

app.get("/user", async (req, res) => {
  try {
    let user = null;
    const userId = req.cookies.userId;

    if (userId) {
      user = await User.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        user = await Admin.findOne({
          where: {
            id: userId,
          },
        });
      }

      if (user) {
        const userObj = user.toJSON();

        if (user instanceof Admin) {
          userObj.userType = UserType.ADMIN;
        }

        return res.status(200).send(userObj);
      } else {
        return res.status(404).send({ message: "Usuário não encontrado" });
      }
    } else {
      return res.redirect("/index.html");
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post("/reset-password", async (req, res) => {
  const email = req.body.email;

  if (!email)
    return res
      .status(400)
      .send({ message: "Você deve fornecer um e-mail para prosseguir" });

  const user = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!user) return res.status(404).send({ message: "Usuário não existe" });

  const code = randomUUID();
  const url = `${req.protocol}://${process.env.APP_HOST}/resetPassword?code=${code}`;
  const sent = sendRecoveryEmail(email, url);
  if (sent) {
    const data = { email: email };
    const resp = await redis.set(code, JSON.stringify(data));

    if (resp) {
      await redis.expire(code, 5 * 60);
      return res.status(200).send({
        message:
          "E-mail de redifinição de senha enviado!\n\nVerifique sua caixa de entrada",
      });
    }
  }
});

app.get("/resetPassword", async (req, res) => {
  const code = req.query.code;

  if (code) {
    const resp = await redis.get(code);
    if (resp) {
      const resetHTML = fs.readFileSync(
        path.join(__dirname, "..", "public", "templates", "senha.html"),
        "utf-8",
      );
      return res.send(resetHTML);
    } else {
      const resetHTML = fs.readFileSync(
        path.join(__dirname, "..", "public", "templates", "venceu.html"),
        "utf-8",
      );
      return res.send(resetHTML);
    }
  }

  return res.status(404).send({ message: "Resource not found" });
});

app.post("/change-password", async (req, res) => {
  const { sniffer, password } = req.body;

  if (!sniffer) return res.status(400).send({ error: "MISSING_PARAMS" });

  const resp = await redis.get(sniffer);
  if (resp) {
    const data = JSON.parse(resp);

    const user = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (!user) return res.status(404).send({ message: "Usuário não existe" });

    user.password = password;
    await user.save();
    await redis.del([sniffer]);

    return res.status(200).send({ message: "Senha alterada com sucesso!" });
  } else {
    return res.status(403).send({
      message:
        "Sua senha já foi alterada, solicite um novo link caso queira alterá-la novamente",
    });
  }
});

const port = process.env.APP_PORT || 8080;

sequelize.sync().then(async function () {
  await redis.on("error", (err) => k.fail(err)).connect();

  k.succeed("Redis connected successfully");

  app.listen(port, () => {
    k.succeed(`Server is running on port ${port}`);
  });
});

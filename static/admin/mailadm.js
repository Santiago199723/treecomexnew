const firebaseConfig = {
  apiKey: "AIzaSyCvww91bXh1KIpVp59AdC94T8K06ymjvxs",
  authDomain: "cadastro-orion-global.firebaseapp.com",
  databaseURL: "https://cadastro-orion-global-default-rtdb.firebaseio.com",
  projectId: "cadastro-orion-global",
  storageBucket: "cadastro-orion-global.appspot.com",
  messagingSenderId: "687560691012",
  appId: "1:687560691012:web:5445782a7ee55a429e9b11",
  measurementId: "G-69FTGZDCGF"
};

firebase.initializeApp(firebaseConfig);

var contactFormDB = firebase.database().ref("cadastro-orion-global");

document.getElementById("cadastro-orion-global").addEventListener("submit", submitForm);

// Mapeia os valores dos estados para suas siglas correspondentes
const estadosSiglas = {
  "": "", // Adicione a sigla padrão para quando nenhum estado for selecionado
  "12": "AC",
  "27": "AL",
  "13": "AM",
  "16": "AP",
  "29": "BA",
  "23": "CE",
  "53": "DF",
  "32": "ES",
  "52": "GO",
  "21": "MA",
  "31": "MG",
  "50": "MS",
  "51": "MT",
  "15": "PA",
  "25": "PB",
  "26": "PE",
  "22": "PI",
  "41": "PR",
  "33": "RJ",
  "24": "RN",
  "11": "RO",
  "14": "RR",
  "43": "RS",
  "42": "SC",
  "28": "SE",
  "35": "SP",
  "17": "TO"
};

function submitForm(e) {
  e.preventDefault();

  var nome = getElementVal("nome");
  var empresa = getElementVal("empresa");
  var cpf = getElementVal("cpf");
  var cnpj = getElementVal("cnpj");
  var tipo = getTipoSelecionado();
  var estadoValue = getElementVal("CodUf");
  var estadoSigla = estadosSiglas[estadoValue]; // Obtém a sigla do estado com base no valor selecionado

  saveMessages(nome, empresa, cpf, cnpj, tipo, estadoSigla);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  document.getElementById("cadastro-orion-global").reset();
}

const saveMessages = (nome, empresa, cpf, cnpj, tipo, estado) => {
  var newContactForm = contactFormDB.push();

  newContactForm.set({
    name: nome,
    empresa: empresa,
    cpf: cpf,
    cnpj: cnpj,
    tipo: tipo,
    estado: estado
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};

function getTipoSelecionado() {
  var checkboxes = document.getElementsByName("tipo");
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      return checkboxes[i].value;
    }
  }
  return null; // Retorna null se nenhum checkbox estiver selecionado
}

window.onload = function () {
  if (!company) {
    window.location.href = "CPF.html";
  }

  refreshCompanyData().then(() => showCompanyData());
};

function sair() {
  localStorage.removeItem("company");
  localStorage.removeItem("process-id");
  window.location.href = "CPF.html";
}

function openModal() {
  document.getElementById("overlay").style.display = "flex"; // Exibe o fundo escuro
}

function closeModal() {
  document.getElementById("overlay").style.display = "none"; // Oculta o fundo escuro
}

function processID() {
  const id = document.getElementById("process-id");
  if (!id.value) {
    alert("Por favor, insira o número do Processo!");
    return;
  }

  for (let i = 0; i < types.length; i++) {
    ref
      .orderByChild(types[i])
      .equalTo(code)
      .once("value", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
          const data = childSnapshot.val();
          if (data) {
            if (data.PROCESS_ID) {
              if (data.PROCESS_ID == id.value) {
                localStorage.setItem("process-id", id.value);
                window.location.href = "/etapa2.html";
                return;
              } else if (data.PROCESS_ID !== id.value) {
                alert("O número do processo está incorreto.");
                return;
              }
            } else {
              data.PROCESS_ID = id.value;
              childSnapshot.ref
                .update(data)
                .then(() => {
                  localStorage.setItem("process-id", id.value);
                  window.location.href = "/etapa2.html";
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          }
        });
      });
  }
}

let offsetX, offsetY;

let draggable = document.querySelector(".modal-container");
let input = document.querySelector("#process-id");

function drag(event) {
  draggable.style.left = event.clientX - offsetX + "px";
  draggable.style.top = event.clientY - offsetY + "px";
}

function stopDragging(event) {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDragging);
}

function draggableHandler(event) {
  event.preventDefault();

  offsetX = event.clientX - draggable.getBoundingClientRect().left;
  offsetY = event.clientY - draggable.getBoundingClientRect().top;

  document.addEventListener("mousemove", drag);

  document.addEventListener("mouseup", stopDragging);
}

draggable.addEventListener("mousedown", draggableHandler);

input.addEventListener("mousedown", function (event) {
  draggable.removeEventListener("mousedown", draggableHandler);
});

input.addEventListener("blur", function (event) {
  draggable.addEventListener("mousedown", draggableHandler);
});

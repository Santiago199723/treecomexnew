function showLoading() {
    const div = document.createElement("div");
    div.classList.add("loading", "centralize");

    const label = document.createElement("label");
    label.innerText = "Conectando...";

    div.appendChild(label);

    document.body.appendChild(div);
}

function hideLoading() {
    const loadings = document.getElementsByClassName("loading");
    if (loadings.length) {
        loadings[0].remove();
    }
}
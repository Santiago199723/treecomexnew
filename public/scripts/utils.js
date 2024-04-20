async function checkSession() {
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}/check-session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

    return response.ok
}


async function fetchCompanyData() {
    const data = JSON.parse(company);
    fetch(`${window.location.protocol}//${window.location.hostname}/company-data`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            unique: data.cpf ? data.cpf : data.cnpj,
        }),
        credentials: "include"
    })
        .then(async (response) => {
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("company", JSON.stringify(data));
            }
        })
        .catch((error) => alert(error));
}

function showCompanyData() {
    const data = JSON.parse(company);
    if (data) {
        document.getElementById("company-name").innerText =
            data.companyName.toUpperCase();
        document.getElementById("company-type").innerText = (
            data.matriz ? "matriz" : "filial"
        ).toUpperCase();
        document.getElementById("company-state").innerText =
            data.country.toUpperCase();
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
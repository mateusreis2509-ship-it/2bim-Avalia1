const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");

let tokenGoogle = null;
let svgAtual = "";
let urlSvg = null;

// Recebe o token enviado pelo Google Identity Services.
window.receberCredencialGoogle = function (resposta) {
  tokenGoogle = resposta.credential;

  mensagem.textContent =
    "Login realizado com sucesso! Agora você pode gerar o desenho.";
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  mensagem.textContent = "";
  area.replaceChildren();
  botaoBaixar.hidden = true;
  svgAtual = "";

  const numero = Number(campoNumero.value);

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 100
  ) {
    mensagem.textContent =
      "Digite um inteiro entre 1 e 100.";
    return;
  }

  if (!tokenGoogle) {
    mensagem.textContent =
      "Faça login com o Google antes de desenhar.";
    return;
  }

  try {
    const resposta = await fetch("/api/desenho", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        numero: numero,
        token: tokenGoogle
      })
    });

    if (resposta.status === 400) {
      mensagem.textContent =
        "Erro 400: número inválido.";
      return;
    }

    if (resposta.status === 401) {
      mensagem.textContent =
        "Erro 401: autenticação inválida.";
      return;
    }

    if (!resposta.ok) {
      mensagem.textContent =
        `Erro ${resposta.status}: não foi possível gerar o desenho.`;
      return;
    }

    svgAtual = await resposta.text();

    if (!/^\s*<svg(?:\s|>)/i.test(svgAtual))  {
      svgAtual = "";
      mensagem.textContent =
        "Resposta inválida do servidor.";
      return;
    }

    if (urlSvg) {
      URL.revokeObjectURL(urlSvg);
    }

    const arquivo = new Blob(
      [svgAtual],
      { type: "image/svg+xml" }
    );

    urlSvg = URL.createObjectURL(arquivo);

    const imagem = document.createElement("img");
    imagem.src = urlSvg;
    imagem.alt = "Desenho assinado";

    area.replaceChildren(imagem);
    botaoBaixar.hidden = false;

  } catch {
    mensagem.textContent =
      "Erro de conexão ao tentar gerar o desenho.";
  }
});

botaoBaixar.addEventListener("click", () => {
  if (!svgAtual) return;

  const arquivo = new Blob(
    [svgAtual],
    { type: "image/svg+xml" }
  );

  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = "desenho-assinado.svg";
  link.click();

  URL.revokeObjectURL(url);
});
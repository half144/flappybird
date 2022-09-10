// criar o elemento onde vai ficar os pares das barreiras
function novoElemento(tagName, className) {
  const elem = document.createElement(tagName); // criar elemento apartir da tag que foi dada como parametro
  elem.className = className; // dar a classe que foi dada como parametro para o elemento criado anteriormente
  return elem; // retornar o elemento ja com a tag(HTML) e a classe
}

function Barreira(reversa = false) {
  // funcao construtora de barreiras
  this.elemento = novoElemento("div", "barreira"); // criando a barreira

  const borda = novoElemento("div", "borda"); // criando a borda atribuindo a tag e a classe (JA PRONTA NO CSS)
  const corpo = novoElemento("div", "corpo");
  this.elemento.appendChild(reversa ? corpo : borda); // se for reversa, vai adicionar o corpo primeiro pra nao ficar invertido
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = (altura) => (corpo.style.height = `${altura}px`); // setar a altura (usado futuramente)
}

function ParDeBarreiras(altura, abertura, x) {
  // funcao construtora de par de barreiras
  this.elemento = novoElemento("div", "par-de-barreiras"); // criar novo elemento de par de barreiras

  this.superior = new Barreira(true); // se conectando com a de cima criando uma barreira superior, ja que o parametro é true
  this.inferior = new Barreira(false);

  this.elemento.appendChild(this.superior.elemento); // adicionar a barreira dentro do par de barreiras criado nessa mesma funcao
  this.elemento.appendChild(this.inferior.elemento);

  this.sortearAbertura = () => {
    const alturaSuperior = Math.random() * (altura - abertura); // definir a altura superior
    const alturaInferior = altura - abertura - alturaSuperior;
    this.superior.setAltura(alturaSuperior); // atriburindo com a funcao setAltura que foi criada na segunda funcao
    this.inferior.setAltura(alturaInferior);
  };
  this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
  this.setX = (x) => (this.elemento.style.left = `${x}px`);
  this.getLargura = () => this.elemento.clientWidth;

  this.sortearAbertura();
  this.setX(x);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  this.pares = [
    new ParDeBarreiras(altura, abertura, largura),
    new ParDeBarreiras(altura, abertura, largura + espaco),
    new ParDeBarreiras(altura, abertura, largura + espaco * 2),
    new ParDeBarreiras(altura, abertura, largura + espaco * 3),
  ];
  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach((par) => {
      par.setX(par.getX() - deslocamento);

      //quando elemento sair da tela
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length);
        par.sortearAbertura();
      }
      const meio = largura / 2;
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;
      if (cruzouOMeio) notificarPonto();
    });
  };
}

function Passaro(alturaJogo) {
  let voando = false;

  this.elemento = novoElemento("img", "passaro");
  this.elemento.src = "imgs/passaro.png";

  this.getY = () => parseInt(this.elemento.style.bottom.split("px")[0]);
  this.setY = (y) => (this.elemento.style.bottom = `${y}px`);

  window.onkeydown = (e) => (voando = true);
  window.onkeyup = (e) => (voando = false);

  this.animar = () => {
    const novoY = this.getY() + (voando ? 5 : -4);
    const alturaMaxima = alturaJogo - this.elemento.clientWidth;
    if (novoY <= 0) {
      this.setY(0);
    } else if (novoY >= alturaMaxima) {
      this.setY(alturaMaxima);
    } else {
      this.setY(novoY);
    }
  };
  this.setY(alturaJogo / 2);
}

function Progresso() {
  this.elemento = novoElemento("span", "progresso");
  this.atualizarPontos = (pontos) => {
    this.elemento.innerHTML = pontos;
  };
  this.atualizarPontos(0);
}

function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach((parDeBarreiras) => {
    if (!colidiu) {
      const superior = parDeBarreiras.superior.elemento;
      const inferior = parDeBarreiras.inferior.elemento;
      colidiu =
        estaoSobrepostos(passaro.elemento, superior) ||
        estaoSobrepostos(passaro.elemento, inferior);
    }
  });
  return colidiu;
}

function FlappyBird() {
  let pontos = 0;

  const areaDoJogo = document.querySelector("[wm-flappy]");
  const altura = areaDoJogo.clientHeight;
  const largura = areaDoJogo.clientWidth;

  const progresso = new Progresso();
  const barreiras = new Barreiras(altura, largura, 200, 400, () =>
    progresso.atualizarPontos(++pontos)
  );
  const passaro = new Passaro(altura);

  areaDoJogo.appendChild(progresso.elemento);
  areaDoJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach((par) => areaDoJogo.appendChild(par.elemento));

  this.start = () => {
    const temporizador = setInterval(() => {
      barreiras.animar();
      passaro.animar();

      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
      }
    }, 16);
  };
}

const botao = document.querySelector(".botao").addEventListener("click", () => {
  document.querySelector("[wm-flappy]").classList.toggle("hide");
  document.querySelector(".start-page").classList.toggle("hide");
  new FlappyBird().start();
});

// 1. Captura os elementos necessários
const slides = document.querySelectorAll('.slide');
const btnProximo = document.getElementById('btn-proximo');
const btnAnterior = document.getElementById('btn-anterior');

let slideAtual = 0;
let intervaloTempo = null;

// 2. Função que atualiza a tela mostrando o slide correto
function mostrarSlide(index) {
  // Remove a classe 'ativo' de todos os slides
  slides.forEach(slide => slide.classList.remove('ativo'));

  // Adiciona 'ativo' apenas no slide da vez
  slides[index].classList.add('ativo');
}

// 3. Função para ir para o próximo slide
function proximoSlide() {
  slideAtual++;
  // Se passar do último slide, volta para o primeiro (0)
  if (slideAtual >= slides.length) {
    slideAtual = 0;
  }
  mostrarSlide(slideAtual);
}

// 4. Função para voltar para o slide anterior
function slideAnterior() {
  slideAtual--;
  // Se voltar antes do primeiro, vai para o último slide
  if (slideAtual < 0) {
    slideAtual = slides.length - 1;
  }
  mostrarSlide(slideAtual);
}

// 5. Inicia e reseta o temporizador automático de 10 segundos
function reiniciarTimer() {
  clearInterval(intervaloTempo); // Limpa o tempo anterior
  intervaloTempo = setInterval(proximoSlide, 10000); // 10000ms = 10s
}

// 6. Eventos de clique nos botões
btnProximo.addEventListener('click', () => {
  proximoSlide();
  reiniciarTimer(); // Reinicia os 10s para não trocar logo após o clique
});

btnAnterior.addEventListener('click', () => {
  slideAnterior();
  reiniciarTimer(); // Reinicia os 10s
});

// 7. Inicia a contagem automática assim que a página carrega
reiniciarTimer();
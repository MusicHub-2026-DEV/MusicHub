const card = document.querySelector('.login-card')

document.querySelectorAll('[data-troca]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        card.dataset.modo = btn.dataset.troca
    })
})
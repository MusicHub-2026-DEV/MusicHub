const card = document.querySelector('.login-card')

document.querySelectorAll('[data-troca]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const trocar = () => card.dataset.modo = btn.dataset.troca

        if (document.startViewTransition) {
            document.startViewTransition(trocar)
        } else {
            trocar()
        }
    })
})
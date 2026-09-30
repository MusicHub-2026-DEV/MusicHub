const btn = document.querySelector('.menu-toggle-btn');
    const menu = document.querySelector('.menu-lateral');
    const overlay = document.querySelector('.menu-overlay');

    function alternarMenu(abrir) {
        menu.classList.toggle('aberto', abrir);
        overlay.classList.toggle('aberto', abrir);
        document.body.classList.toggle('menu-aberto', abrir);
        btn.setAttribute('aria-expanded', abrir);
    }

    btn.addEventListener('click', () => alternarMenu(!menu.classList.contains('aberto')));
    overlay.addEventListener('click', () => alternarMenu(false));
    document.addEventListener('keydown', e => e.key === 'Escape' && alternarMenu(false));

    window.matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && alternarMenu(false));
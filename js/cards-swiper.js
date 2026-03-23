    new Swiper('.cards-swiper', {
        slidesPerView: 1,
        spaceBetween: 18,
        speed: 700,
        navigation: {
        nextEl: '.nav-next',
        prevEl: '.nav-prev',
        },
        pagination: {
        el: '.swiper-pagination',
        clickable: true,
        },
        breakpoints: {
        540: {
            slidesPerView: 1.7,
        },
        640: {
            slidesPerView: 2,
        },
        900: {
            slidesPerView: 3,
        },
        1080: {
            slidesPerView: 3,
        }
        }
    });

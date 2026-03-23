        // preloader
        document.body.style.overflow = 'hidden';
        const loader = () => {
            document.body.style.overflow = '';
            const preloader = document.getElementById('preloader');
            const fadeout = setInterval(() => {
                const opacity = getComputedStyle(preloader).opacity;
                opacity > 0 ? preloader.style.opacity = opacity - 0.1000 : (clearInterval(fadeout), preloader.remove());
            }, 15);
        }

        setTimeout(() => loader(), 2000);
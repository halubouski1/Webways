window.addEventListener('load', function () {

  CookieConsent.run({

    guiOptions: {
      consentModal: {
        layout: 'bar',
        position: 'bottom',
        equalWeightButtons: false,
        flipButtons: false
      }
    },

    categories: {
      necessary: {
        enabled: true,
        readOnly: true
      },
      analytics: {
        enabled: false,
        autoClear: {
          cookies: [
            { name: /^_ga/ },
            { name: '_gid' },
            { name: /^_ym_/ }
          ]
        }
      }
    },

    language: {
      default: 'ru',
      translations: {
        ru: {
          consentModal: {
            title: 'Мы используем файлы cookie',
            description: 'Мы используем cookie для корректной работы сайта и анализа трафика.',
            acceptAllBtn: 'Принять',
            acceptNecessaryBtn: 'Отклонить',
            footer: '<a href="/privacy_policy.pdf">Политика конфиденциальности</a>'
          }
        }
      }
    }

  });

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  let analyticsStarted = false;
  function enableAnalytics() {
    if (analyticsStarted) return;
    analyticsStarted = true;

    var gaSrc = 'https://www.googletagmanager.com/gtag/js?id=G-EDBSSXJLQ7';
    var alreadyLoaded = false;
    for (var s = 0; s < document.scripts.length; s++) {
      if (document.scripts[s].src === gaSrc) { alreadyLoaded = true; break; }
    }
    if (!alreadyLoaded) {
      var gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = gaSrc;
      document.head.appendChild(gaScript);
    }

    gtag('js', new Date());
    gtag('config', 'G-EDBSSXJLQ7');

    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=108750640', 'ym');

    ym(108750640, 'init', {
      ssr: true,
      webvisor: true,
      clickmap: true,
      ecommerce: "dataLayer",
      referrer: document.referrer,
      url: location.href,
      accurateTrackBounce: true,
      trackLinks: true
    });
  }

  if (CookieConsent.acceptedCategory('analytics')) {
    enableAnalytics();
  }

  window.addEventListener('cc:onConsent', function () {
    if (CookieConsent.acceptedCategory('analytics')) {
      enableAnalytics();
    }
  });

});
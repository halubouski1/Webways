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
            { name: '_gid' }
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

  if (CookieConsent.acceptedCategory('analytics')) {
    gtag('js', new Date());
    gtag('config', 'G-EDBSSXJLQ7');
  }

  window.addEventListener('cc:onConsent', function () {
    if (CookieConsent.acceptedCategory('analytics')) {
      gtag('js', new Date());
      gtag('config', 'G-EDBSSXJLQ7');
    }
  });

});
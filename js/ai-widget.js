(function () {
  'use strict';

  /* ── SVG icons ── */
  var ICON_CHAT = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H18L22 22V4C22 2.9 21.1 2 20 2Z" fill="#fff"/></svg>';
  var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var ICON_BOT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="12" rx="3" stroke="#fff" stroke-width="2"/><circle cx="9" cy="14" r="1.5" fill="#fff"/><circle cx="15" cy="14" r="1.5" fill="#fff"/><path d="M12 4V8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_MIC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke="#fff" stroke-width="2"/><path d="M5 10V11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11V10" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M12 18V22" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ── Conversation history ── */
  var history = [];

  /* ── Parse AI response: extract markdown links [text](url) ── */
  function parseResponse(text) {
    var linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    var links = [];
    var match;

    while ((match = linkRegex.exec(text)) !== null) {
      links.push({ title: match[1], url: match[2] });
    }

    var cleanText = text.replace(linkRegex, '').replace(/\n{3,}/g, '\n\n').trim();

    return { text: cleanText, links: links };
  }

  /* ── Call API ── */
  async function askAI(userMessage) {
    history.push({ role: 'user', content: userMessage });

    var res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    var data = await res.json();

    if (!res.ok) {
      console.error('AI Widget error:', data);
      throw new Error(data.error || 'API error');
    }

    var reply = data.reply || 'Не удалось получить ответ.';

    history.push({ role: 'assistant', content: reply });

    if (history.length > 20) history = history.slice(-20);

    return parseResponse(reply);
  }

  /* ── Build DOM ── */
  function createWidget() {
    var wrapper = document.createElement('div');
    wrapper.className = 'ai-widget';
    wrapper.id = 'aiWidget';
    wrapper.innerHTML =
      '<div class="ai-widget__panel" id="aiPanel">' +
        '<div class="ai-widget__header">' +
          '<div class="ai-widget__header-left">' +
            '<div class="ai-widget__avatar">' + ICON_BOT + '</div>' +
            '<div class="ai-widget__header-info">' +
              '<span class="ai-widget__header-title">AI-навигатор</span>' +
              '<span class="ai-widget__header-subtitle">Webways</span>' +
            '</div>' +
          '</div>' +
          '<button class="ai-widget__close" id="aiClose" aria-label="Закрыть">' +
            ICON_CLOSE +
          '</button>' +
        '</div>' +
        '<div class="ai-widget__messages" id="aiMessages"></div>' +
        '<div class="ai-widget__input-area">' +
          '<input class="ai-widget__input" id="aiInput" type="text" placeholder="Задайте вопрос…" autocomplete="off">' +
          '<button class="ai-widget__btn ai-widget__voice" id="aiVoice" aria-label="Голосовой ввод">' + ICON_MIC + '</button>' +
          '<button class="ai-widget__btn ai-widget__send" id="aiSend" aria-label="Отправить">' + ICON_SEND + '</button>' +
        '</div>' +
      '</div>' +
      '<button class="ai-widget__toggle" id="aiToggle" aria-label="AI-навигатор">' +
        ICON_CHAT +
      '</button>';

    document.body.appendChild(wrapper);
    return wrapper;
  }

  /* ── Widget controller ── */
  function init() {
    var widget = createWidget();
    var toggle = widget.querySelector('#aiToggle');
    var closeBtn = widget.querySelector('#aiClose');
    var messages = widget.querySelector('#aiMessages');
    var input = widget.querySelector('#aiInput');
    var sendBtn = widget.querySelector('#aiSend');
    var voiceBtn = widget.querySelector('#aiVoice');

    var isOpen = false;
    var isSending = false;
    var recognition = null;
    var isRecording = false;

    /* ── Voice setup ── */
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = function (e) {
        var text = e.results[0][0].transcript;
        input.value = text;
        stopRecording();
        handleSend();
      };
      recognition.onerror = function () { stopRecording(); };
      recognition.onend = function () { stopRecording(); };
    } else {
      voiceBtn.style.display = 'none';
    }

    function startRecording() {
      if (!recognition || isRecording) return;
      isRecording = true;
      voiceBtn.classList.add('is-recording');
      recognition.start();
    }

    function stopRecording() {
      if (!isRecording) return;
      isRecording = false;
      voiceBtn.classList.remove('is-recording');
      try { recognition.stop(); } catch (_) {}
    }

    /* ── Toggle ── */
    function openWidget() {
      isOpen = true;
      widget.classList.add('is-open');
      toggle.innerHTML = ICON_CLOSE;
      input.focus();
    }

    function closeWidget() {
      isOpen = false;
      widget.classList.remove('is-open');
      toggle.innerHTML = ICON_CHAT;
      stopRecording();
    }

    toggle.addEventListener('click', function () {
      isOpen ? closeWidget() : openWidget();
    });
    closeBtn.addEventListener('click', closeWidget);

    /* ── Messages ── */
    function scrollBottom() {
      requestAnimationFrame(function () {
        messages.scrollTop = messages.scrollHeight;
      });
    }

    function escapeHtml(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function addMessage(type, html) {
      var iconHtml = type === 'bot'
        ? '<div class="ai-msg__icon">' + ICON_BOT + '</div>'
        : '';
      var div = document.createElement('div');
      div.className = 'ai-msg ai-msg--' + type;
      div.innerHTML = iconHtml + '<div class="ai-msg__bubble">' + html + '</div>';
      messages.appendChild(div);
      scrollBottom();
      return div;
    }

    function addTyping() {
      var div = document.createElement('div');
      div.className = 'ai-msg ai-msg--bot';
      div.id = 'aiTyping';
      div.innerHTML =
        '<div class="ai-msg__icon">' + ICON_BOT + '</div>' +
        '<div class="ai-msg__bubble"><div class="ai-msg__typing"><span></span><span></span><span></span></div></div>';
      messages.appendChild(div);
      scrollBottom();
    }

    function removeTyping() {
      var el = document.getElementById('aiTyping');
      if (el) el.remove();
    }

    function renderBotMessage(parsed) {
      var html = '<div>' + escapeHtml(parsed.text) + '</div>';

      if (parsed.links.length > 0) {
        html += '<div class="ai-msg__links">';
        for (var i = 0; i < parsed.links.length; i++) {
          var link = parsed.links[i];
          html += '<a class="ai-msg__link" href="' + escapeHtml(link.url) + '">' +
                  ICON_ARROW + ' ' + escapeHtml(link.title) + '</a>';
        }
        html += '</div>';
      }

      addMessage('bot', html);
    }

    /* ── Send message ── */
    async function handleSend() {
      var text = input.value.trim();
      if (!text || isSending) return;

      isSending = true;
      sendBtn.style.opacity = '0.5';
      addMessage('user', escapeHtml(text));
      input.value = '';
      addTyping();

      try {
        var parsed = await askAI(text);
        removeTyping();
        renderBotMessage(parsed);
      } catch (err) {
        removeTyping();
        addMessage('bot', '<div>Произошла ошибка. Попробуйте ещё раз или напишите нам напрямую в <a class="ai-msg__link" href="/contacts">' + ICON_ARROW + ' Контакты</a></div>');
      } finally {
        isSending = false;
        sendBtn.style.opacity = '1';
      }
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleSend();
    });
    voiceBtn.addEventListener('click', function () {
      isRecording ? stopRecording() : startRecording();
    });

    /* ── Chip clicks (delegated) ── */
    messages.addEventListener('click', function (e) {
      var chip = e.target.closest('.ai-widget__chip');
      if (chip) {
        input.value = chip.getAttribute('data-chip');
        handleSend();
      }
    });

    /* ── Close on Escape ── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeWidget();
    });

    /* ── Welcome message ── */
    addMessage('bot',
      '<div>Привет! Я AI-навигатор Webways. Задайте вопрос — и я помогу найти нужную страницу.</div>' +
      '<div class="ai-widget__chips">' +
        '<button class="ai-widget__chip" data-chip="Услуги и цены">Услуги и цены</button>' +
        '<button class="ai-widget__chip" data-chip="Примеры работ">Примеры работ</button>' +
        '<button class="ai-widget__chip" data-chip="Контакты">Контакты</button>' +
      '</div>'
    );
  }

  /* ── Start ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

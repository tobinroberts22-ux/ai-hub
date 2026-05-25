(function () {
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var businessId = script.getAttribute('data-id') || new URL(script.src).searchParams.get('id');
  if (!businessId) return;

  var baseUrl = script.src.replace('/embed.js', '').replace(/\?.*/, '');

  // Styles
  var style = document.createElement('style');
  style.textContent = [
    '#aihub-bubble{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:#2563eb;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(37,99,235,0.4);z-index:999998;display:flex;align-items:center;justify-content:center;transition:transform 0.2s,box-shadow 0.2s;}',
    '#aihub-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(37,99,235,0.5);}',
    '#aihub-bubble svg{width:26px;height:26px;fill:white;}',
    '#aihub-iframe-container{position:fixed;bottom:90px;right:24px;width:370px;height:580px;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.18);z-index:999999;display:none;border:1px solid #e5e7eb;}',
    '#aihub-iframe-container.open{display:block;}',
    '#aihub-iframe{width:100%;height:100%;border:none;}',
    '@media(max-width:480px){#aihub-iframe-container{width:calc(100vw - 24px);height:calc(100vh - 110px);right:12px;bottom:80px;border-radius:12px;}}',
  ].join('');
  document.head.appendChild(style);

  // Bubble button
  var bubble = document.createElement('button');
  bubble.id = 'aihub-bubble';
  bubble.setAttribute('aria-label', 'Chat with us');
  bubble.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  document.body.appendChild(bubble);

  // Iframe container
  var container = document.createElement('div');
  container.id = 'aihub-iframe-container';
  var iframe = document.createElement('iframe');
  iframe.id = 'aihub-iframe';
  iframe.src = baseUrl + '/widget/' + businessId;
  iframe.title = 'Chat Assistant';
  iframe.allow = 'microphone';
  container.appendChild(iframe);
  document.body.appendChild(container);

  var open = false;
  bubble.addEventListener('click', function () {
    open = !open;
    container.classList.toggle('open', open);
    bubble.innerHTML = open
      ? '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      : '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  });
})();

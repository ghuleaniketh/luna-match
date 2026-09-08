import fs from 'fs';

async function run() {
  const targetRes = await fetch('http://127.0.0.1:9222/json');
  const targets = await targetRes.json();
  const pageTarget = targets.find(t => t.title === 'luna-match' || t.url.includes('5173'));
  if (!pageTarget) {
    console.error('Page target not found in Chrome!');
    process.exit(1);
  }

  console.log('Connecting to page:', pageTarget.webSocketDebuggerUrl);
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
      console.log(`[Browser Console ${msg.params.type}]:`, args);
    }
    if (msg.method === 'Network.requestWillBeSent') {
      const url = msg.params.request.url;
      if (url.includes('/orchestrate') || url.includes('/api/')) {
        console.log(`[Browser Network Request]: ${msg.params.request.method} ${url}`);
      }
    }
    if (msg.method === 'Network.responseReceived') {
      const url = msg.params.response.url;
      if (url.includes('/orchestrate') || url.includes('/api/')) {
        console.log(`[Browser Network Response]: ${msg.params.response.status} ${url}`);
      }
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
  };

  ws.onopen = async () => {
    try {
      await call('Runtime.enable');
      await call('Page.enable');
      await call('Network.enable');

      // Check current page state
      const state = await call('Runtime.evaluate', {
        expression: `(() => {
          const chatOpen = Boolean(document.querySelector('aside[aria-label="LUNA AI assistant"]'));
          const attachCards = document.querySelectorAll('div[class*="border-cyan-400"]');
          const sendBtn = document.querySelector('button[aria-label="Send message"]');
          return {
            chatOpen,
            attachmentsCount: attachCards.length,
            sendDisabled: sendBtn ? sendBtn.disabled : null,
            bodySnippet: document.body.innerText.slice(0, 200)
          };
        })()`,
        returnByValue: true
      });

      console.log('Current state:', state.result.value);

      // If chat is not open, open it
      if (!state.result.value.chatOpen) {
        console.log('Opening chat...');
        await call('Runtime.evaluate', {
          expression: `(() => {
            const toggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ask LUNA AI'));
            if (toggle) toggle.click();
          })()`
        });
        await new Promise(r => setTimeout(r, 1000));
      }

      // Check if attachments are present. If not, attach them.
      const attachCheck = await call('Runtime.evaluate', {
        expression: `(() => {
          const sendBtn = document.querySelector('button[aria-label="Send message"]');
          return sendBtn && !sendBtn.disabled;
        })()`,
        returnByValue: true
      });

      console.log('Is send button already enabled?', attachCheck.result.value);

      if (!attachCheck.result.value) {
        console.log('Attaching sou1.jpeg and res1.jpeg...');
        const sou1Base64 = fs.readFileSync('/run/media/yesh/NEXUS LAB/SIH26/luna-match/sampledataset/sou1.jpeg').toString('base64');
        const res1Base64 = fs.readFileSync('/run/media/yesh/NEXUS LAB/SIH26/luna-match/sampledataset/res1.jpeg').toString('base64');

        await call('Runtime.evaluate', {
          expression: `(async () => {
            function b64toBlob(b64Data, contentType='image/jpeg') {
              const sliceSize = 512;
              const byteCharacters = atob(b64Data);
              const byteArrays = [];
              for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);
                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }
                byteArrays.push(new Uint8Array(byteNumbers));
              }
              return new Blob(byteArrays, {type: contentType});
            }

            const souBlob = b64toBlob("${sou1Base64}");
            const resBlob = b64toBlob("${res1Base64}");

            const file1 = new File([souBlob], "sou1.jpeg", { type: "image/jpeg" });
            const file2 = new File([resBlob], "res1.jpeg", { type: "image/jpeg" });

            const dt1 = new DataTransfer();
            dt1.items.add(file1);
            const input = document.querySelector('input[type="file"]');
            input.files = dt1.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));

            await new Promise(r => setTimeout(r, 600));

            const dt2 = new DataTransfer();
            dt2.items.add(file2);
            input.files = dt2.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          })()`
        });

        await new Promise(r => setTimeout(r, 1000));
      }

      // Now click the send button!
      console.log('Clicking Send button...');
      const clickResult = await call('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.querySelector('button[aria-label="Send message"]');
          if (!btn) return 'SEND_BTN_NOT_FOUND';
          if (btn.disabled) return 'SEND_BTN_DISABLED';
          btn.click();
          return 'CLICKED';
        })()`,
        returnByValue: true
      });
      console.log('Click result:', clickResult.result.value);

      console.log('Awaiting registration response (up to 40s)...');
      const start = Date.now();
      let completed = false;
      let finalDetails = null;

      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const check = await call('Runtime.evaluate', {
          expression: `(() => {
            const spans = Array.from(document.querySelectorAll('span, p, div')).map(el => el.textContent);
            const hasCandidate = spans.some(s => s.includes('Candidate matches'));
            const hasInliers = spans.some(s => s.includes('Inlier matches') || s.includes('Inliers'));
            const hasRmse = spans.some(s => s.includes('RMSE'));
            const isTyping = Boolean(document.querySelector('.animate-bounce'));
            const messageTexts = Array.from(document.querySelectorAll('.leading-relaxed')).map(el => el.textContent);
            return {
              hasCandidate,
              hasInliers,
              hasRmse,
              isTyping,
              messageCount: messageTexts.length,
              latestMessage: messageTexts[messageTexts.length - 1] || ''
            };
          })()`,
          returnByValue: true
        });

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[${elapsed}s] typing=${check.result.value.isTyping}, candidate=${check.result.value.hasCandidate}, rmse=${check.result.value.hasRmse}`);

        if (check.result.value.hasCandidate && check.result.value.hasRmse) {
          completed = true;
          finalDetails = check.result.value;
          break;
        }
      }

      // Capture final screenshot
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('/home/yesh/.gemini/antigravity-ide/brain/019091e9-1b71-4345-821e-6a2586e27235/smoke_chat_result.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved /home/yesh/.gemini/antigravity-ide/brain/019091e9-1b71-4345-821e-6a2586e27235/smoke_chat_result.png');
      console.log('Final Details:', JSON.stringify(finalDetails));
      ws.close();
      process.exit(completed ? 0 : 2);
    } catch (e) {
      console.error('Error during execution:', e);
      ws.close();
      process.exit(1);
    }
  };
}

run();

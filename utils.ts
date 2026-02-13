import { Message, Role } from './types';

export const parseChatHtml = (htmlContent: string): Message[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const messages: Message[] = [];
  
  // Select all conversation turns
  const articles = doc.querySelectorAll('article[data-turn]');
  
  articles.forEach((article, index) => {
    const roleAttr = article.getAttribute('data-turn');
    if (!roleAttr) return;
    
    // Map 'user'/'assistant' to Role type
    // Note: The HTML uses 'user' and 'assistant', which matches our Role type.
    const role = roleAttr as Role;
    const id = article.getAttribute('data-turn-id') || `imported-${index}-${Date.now()}`;
    
    let content = '';
    
    if (role === 'user') {
        const textEl = article.querySelector('div[data-message-author-role="user"] .whitespace-pre-wrap');
        if (textEl) {
            content = textEl.textContent || '';
        } else {
            // Check for images only messages
            const imgEl = article.querySelector('img[alt="已上传的图片"]');
            if (imgEl) {
                content = '[Image Uploaded]'; // Placeholder for now
            }
        }
    } else if (role === 'assistant') {
        // Assistant messages might be split into multiple .markdown divs (e.g. tool use, then text)
        // We select all .markdown elements within this turn.
        const markdownEls = article.querySelectorAll('.markdown');
        const parts: string[] = [];
        
        markdownEls.forEach(el => {
            parts.push(extractMarkdownText(el));
        });
        
        content = parts.join('\n\n');
    }
    
    if (content.trim()) {
        messages.push({ 
            id, 
            role, 
            content: content.trim(),
            childrenIds: []
        });
    }
  });
  
  return messages;
};

export const exportChatToHtml = (messages: Message[]): string => {
  const turnsHtml = messages.map(msg => {
    if (msg.role === 'user') {
      return `
        <article data-turn="user" data-turn-id="${msg.id}">
          <div data-message-author-role="user">
            <div class="whitespace-pre-wrap">${escapeHtml(msg.content)}</div>
          </div>
        </article>
      `;
    } else if (msg.role === 'assistant') {
      return `
        <article data-turn="assistant" data-turn-id="${msg.id}">
          <div class="markdown">${escapeHtml(msg.content)}</div>
        </article>
      `;
    }
    return '';
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Chat Export</title>
</head>
<body>
${turnsHtml}
</body>
</html>`;
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractMarkdownText(element: Element): string {
  let text = '';
  // Use childNodes to get text nodes mixed with elements
  const children = Array.from(element.childNodes);
  
  if (children.length === 0) {
    return element.textContent || '';
  }

  children.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      
      if (tagName === 'p') {
        text += extractMarkdownText(el) + '\n\n';
      } else if (tagName === 'pre') {
        const code = el.querySelector('code');
        if (code) {
           const langClass = code.className || '';
           // Extract language from class if possible (e.g. language-python)
           let lang = '';
           if (langClass.includes('language-')) {
               const match = langClass.match(/language-([a-zA-Z0-9_-]+)/);
               if (match) lang = match[1];
           }
           text += '```' + lang + '\n' + (code.textContent || '') + '\n```\n\n';
        } else {
           text += (el.textContent || '') + '\n\n';
        }
      } else if (tagName === 'ul') {
        Array.from(el.children).forEach(li => {
            if (li.tagName.toLowerCase() === 'li') {
                text += '- ' + extractMarkdownText(li) + '\n';
            }
        });
        text += '\n';
      } else if (tagName === 'ol') {
        Array.from(el.children).forEach((li, index) => {
            if (li.tagName.toLowerCase() === 'li') {
                text += `${index + 1}. ` + extractMarkdownText(li) + '\n';
            }
        });
        text += '\n';
      } else if (tagName === 'li') {
        text += extractMarkdownText(el);
      } else if (tagName === 'a') {
         text += `[${el.textContent}](${el.getAttribute('href')})`;
      } else if (tagName === 'br') {
         text += '\n';
      } else {
        // spans, strongs, divs etc. recurse
        text += extractMarkdownText(el);
      }
    }
  });
  
  return text;
}
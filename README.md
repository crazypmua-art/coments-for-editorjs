 
  <h1>Editor.js Inline Commenting Plugin</h1>
  <p>A lightweight plugin for Editor.js that brings Google Docs–style inline comments to your editor.</p>

  <h2>Features</h2>
  <ul>
    <li>Inline Comments: Highlight any text and attach comments via a popup UI.</li>
    <li>Persistent Storage: Saves comments in <code>localStorage</code>.</li>
    <li>Comment Sidebar: Shows all comments with jump-links.</li>
    <li>Smooth Navigation: Click to scroll & highlight the text block.</li>
    <li>Resolve & Delete: Mark comments as done or remove them.</li>
    <li>Replies: Threaded replies to each comment.</li>
    <li>Custom Styles: Override CSS classes for your design.</li>
  </ul>

  <h2>Installation</h2>
  <ol>
    <li>Clone repo:<br>
      <code>git clone [https://github.com/your-username/editorjs-inline-comments.git](https://github.com/crazypmua-art/coments-for-editorjs.git)</code>
    </li>
    <li>Include files:<br>
      <code>&lt;link rel="stylesheet" href="comment-plugin.css"&gt;<br>
      &lt;script type="module" src="comment-plugin.js"&gt;&lt;/script&gt;</code>
    </li>
  </ol>

  <h2>Usage</h2>
  <p>Initialize Editor.js with the <code>CommentInlineTool</code>:</p>
  <pre><code>import EditorJS from '@editorjs/editorjs';
import CommentInlineTool from './comment-plugin.js';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    comment: { class: CommentInlineTool, shortcut: 'CTRL+SHIFT+M' }
  }
});</code></pre>
  <ul>
    <li>Select text → click comment button → popup appears.</li>
    <li>Enter comment → click “Add” or Ctrl+Enter.</li>
    <li>Manage in sidebar: view, resolve, reply, delete.</li>
  </ul>

  <h2>Configuration</h2>
  <ul>
    <li><strong>Storage</strong>: change <code>localStorage</code> calls to your API.</li>
    <li><strong>Styles</strong>: override <code>.cdx-comment</code>, <code>.comment-popup</code>, <code>.comments-sidebar</code>.</li>
  </ul>

  <h2>Contributing</h2>
  <ul>
    <li>Fork → branch → commit → PR.</li>
  </ul>

  <h2>License</h2>
  <p>MIT. See <a href="LICENSE">LICENSE</a>.</p>

  <h2>Contact</h2>
  <p>Telegram: <a href="https://t.me/crazypm_ua">@crazypm_ua</a></p>
</body>
</html>

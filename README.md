Editor.js Inline Commenting Plugin

A lightweight plugin for Editor.js that brings Google Docs–style inline comments to your editor.

Features

Inline Comments: Highlight any text within the editor and attach comments via a clean, customizable popup UI.

Persistent Storage: Saves comments in localStorage (easily switch to a server API).

Comment Sidebar: Displays all comments in a fixed sidebar with previews, timestamps, and quick-jump links.

Smooth Navigation: Click a comment to scroll and highlight the associated text block.

Resolve & Delete: Mark comments as resolved or delete them directly from the sidebar.

Replies: Add threaded replies to each comment.

Custom Styles: Easily override CSS variables or classes to match your project’s design.

Installation

Clone this repository:

git clone https://github.com/your-username/editorjs-inline-comments.git

Include the CSS and JavaScript in your project:

<link rel="stylesheet" href="path/to/comment-plugin.css">
<script type="module" src="path/to/comment-plugin.js"></script>

Usage

Initialize Editor.js with the CommentInlineTool:

import EditorJS from '@editorjs/editorjs';
import CommentInlineTool from './path/to/comment-plugin.js';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    comment: {
      class: CommentInlineTool,
      shortcut: 'CTRL+SHIFT+M'
    }
    // other tools...
  }
});

Highlight Text: Select any text in the editor and click the comment button in the inline toolbar.

Add Comment: A popup will appear. Enter your comment and click Add or press Ctrl+Enter.

View & Manage: Open the comment sidebar to view, resolve, reply, or delete comments.

Configuration

Storage: By default, comments are stored in localStorage. To switch to a backend API, replace localStorage calls with your fetch/XHR logic.

Styles: Override the following CSS classes to customize appearance:

.cdx-comment — Inline comment badge.

.comment-popup — Popup container.

.comments-sidebar — Sidebar panel.

Contributing

Fork the repository.

Create a feature branch (git checkout -b feature-name).

Commit your changes (git commit -m "Add awesome feature").

Push to the branch (git push origin feature-name).

Open a pull request.

License

This project is licensed under the MIT License. See LICENSE for details.

Contact

For any questions or support, please contact the developer via Telegram: @crazypm_ua

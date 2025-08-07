import EditorJS from 'https://unpkg.com/@editorjs/editorjs@latest?module';
import Header from 'https://unpkg.com/@editorjs/header@latest?module';
import Paragraph from 'https://unpkg.com/@editorjs/paragraph@latest?module';
import List from 'https://unpkg.com/@editorjs/list@latest?module';
import Checklist from 'https://unpkg.com/@editorjs/checklist@latest?module';
import Quote from 'https://unpkg.com/@editorjs/quote@latest?module';
import Embed from 'https://unpkg.com/@editorjs/embed@latest?module';
import Code from 'https://unpkg.com/@editorjs/code@latest?module';
import Table from 'https://unpkg.com/@editorjs/table@latest?module';
import Marker from 'https://unpkg.com/@editorjs/marker@latest?module';
import LinkTool from 'https://unpkg.com/@editorjs/link@latest?module';
import ImageTool from 'https://unpkg.com/@editorjs/image@latest?module';
import Delimiter from 'https://unpkg.com/@editorjs/delimiter@latest?module';
import Underline from 'https://unpkg.com/@editorjs/underline@latest?module';

// Global variables
let currentSelection = null;
let comments = JSON.parse(localStorage.getItem('editor-comments')) || [];
let commentCounter = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
let selectionMarkers = [];
let editor = null;
let replyingTo = null; // ID of comment being replied to

// Custom inline tool for comments
class CommentInlineTool {
  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      span: {
        class: 'cdx-comment',
        'data-comment-id': true
      }
    };
  }

  static get title() {
    return 'Comment';
  }

  constructor({api}) {
    this.api = api;
    this.button = null;
    this.tag = 'span';
    this.class = 'cdx-comment';
    this._state = false;
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-text-icon lucide-message-square-text"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M7 11h10"/><path d="M7 15h6"/><path d="M7 7h8"/></svg>';
    this.button.classList.add(this.api.styles.inlineToolButton);
    
    this.button.addEventListener('click', () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        this.handleCommentCreation(selection);
      } else {
        alert('Please select text to comment on');
      }
    });
    
    return this.button;
  }

  handleCommentCreation(selection) {
    // Check if selection is in the editor
    const editorElement = document.getElementById('editorjs');
    const range = selection.getRangeAt(0);
    
    if (!editorElement.contains(range.commonAncestorContainer)) {
      console.error('Selection is not in the editor');
      return;
    }
    
    // Save selection
    currentSelection = range.cloneRange();
    
    // Clean popup from previous elements
    cleanPopup();
    
    // Show popup
    document.querySelector('.comment-popup').style.display = 'block';
    document.getElementById('comment-text').focus();
  }

  surround(range) {
    if (!range) return;
    
    // Check if range is in the editor
    const editorElement = document.getElementById('editorjs');
    if (!editorElement.contains(range.commonAncestorContainer)) {
      console.error('Range is not in the editor');
      return;
    }
    
    const selectedText = range.extractContents();
    const wrapper = document.createElement(this.tag);
    const commentId = commentCounter++;
    
    wrapper.classList.add(this.class);
    wrapper.setAttribute('data-comment-id', commentId);
    wrapper.appendChild(selectedText); // Keep the text
    range.insertNode(wrapper);
    
    currentSelection = range.cloneRange();
    
    // Clean popup from previous elements
    cleanPopup();
    
    document.querySelector('.comment-popup').style.display = 'block';
    document.getElementById('comment-text').focus();
  }

  checkState() {
    const selection = window.getSelection();
    this._state = selection && !selection.isCollapsed;
    this.button.classList.toggle(this.api.styles.inlineToolButtonActive, this._state);
  }
}

// Initialize EditorJS
editor = new EditorJS({
  holder: 'editorjs',
  placeholder: 'Start typing...',
  tools: {
    header: {
      class: Header,
      inlineToolbar: ['link', 'comment']
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    list: {
      class: List,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    checklist: {
      class: Checklist,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    quote: {
      class: Quote,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    embed: {
      class: Embed,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    code: {
      class: Code,
      shortcut: 'CMD+SHIFT+C'
    },
    table: {
      class: Table,
      inlineToolbar: ['bold', 'italic', 'link', 'comment']
    },
    marker: {
      class: Marker,
      shortcut: 'CMD+SHIFT+M'
    },
    linkTool: {
      class: LinkTool,
      config: { endpoint: '/fetchUrl' }
    },
    image: {
      class: ImageTool,
      config: { endpoints: { byFile: '/uploadFile' } }
    },
    delimiter: {
      class: Delimiter,
      inlineToolbar: false
    },
    underline: {
      class: Underline,
      shortcut: 'CMD+U'
    },
    comment: {
      class: CommentInlineTool,
      shortcut: 'CMD+SHIFT+Q'
    }
  },
  onReady: () => {
    console.log('✅ Editor.js ready!');
    renderComments();
    // Delayed comment restoration
    setTimeout(restoreComments, 1000);
  },
  onChange: async () => {
    const data = await editor.save();
    console.log('📝 Content:', data);
  }
});

// Function to save comment
function saveComment() {
  const popup = document.querySelector('.comment-popup');
  const commentText = document.getElementById('comment-text').value.trim();
  
  // If this is a reply to a comment
  if (replyingTo) {
    saveReply();
    return;
  }
  
  if (!commentText || !currentSelection) {
    popup.style.display = 'none';
    document.getElementById('comment-text').value = '';
    cleanPopup();
    return;
  }
  
  // Additional check that selection is still valid
  if (currentSelection.collapsed) {
    console.error('Selection became empty');
    popup.style.display = 'none';
    document.getElementById('comment-text').value = '';
    cleanPopup();
    return;
  }

  const commentId = commentCounter++;
  const selectedText = currentSelection.toString();
  
  try {
    // Restore selection in editor
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(currentSelection);
    
    // Check if selection is in the editor
    const editorElement = document.getElementById('editorjs');
    if (!editorElement.contains(currentSelection.commonAncestorContainer)) {
      console.error('Selection is not in the editor');
      popup.style.display = 'none';
      document.getElementById('comment-text').value = '';
      return;
    }
    
    // Create wrapper for comment with text
    const wrapper = document.createElement('span');
    wrapper.classList.add('cdx-comment');
    wrapper.setAttribute('data-comment-id', commentId);
    wrapper.textContent = selectedText; // Keep the text
    
    // Insert wrapper in place of selected text
    currentSelection.deleteContents();
    currentSelection.insertNode(wrapper);
    
    // Save comment
    comments.push({
      id: commentId,
      text: commentText,
      content: selectedText,
      timestamp: new Date().toISOString(),
      resolved: false,
      author: 'User', // Can add authentication system
      replies: [] // Array of replies
    });
    
    localStorage.setItem('editor-comments', JSON.stringify(comments));
    
    // Hide popup and clear it
    popup.style.display = 'none';
    document.getElementById('comment-text').value = '';
    cleanPopup();
    
    renderComments();
    
    // Update Editor.js
    if (editor) {
      editor.save();
    }
    
    console.log('Comment successfully added:', commentId);
    
  } catch (error) {
    console.error('Error adding comment:', error);
    popup.style.display = 'none';
    document.getElementById('comment-text').value = '';
    cleanPopup();
  }
}

// Function to update comment statistics
function updateCommentsStats() {
  const statsElement = document.getElementById('comments-stats');
  const total = comments.length;
  const resolved = comments.filter(c => c.resolved).length;
  const pending = total - resolved;
  
  statsElement.innerHTML = `<small style="color: #6c757d;">(${pending} active, ${resolved} resolved)</small>`;
}

// Function to display comments in sidebar
function renderComments() {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '';
  
  // Update statistics
  updateCommentsStats();
  
  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = `comment-item ${comment.resolved ? 'resolved' : ''}`;
    
    // Generate HTML for replies
    let repliesHtml = '';
    if (comment.replies && comment.replies.length > 0) {
      repliesHtml = '<div class="comment-replies">';
      comment.replies.forEach(reply => {
        repliesHtml += `
          <div class="comment-reply">
            <div class="comment-reply-header">
              <div class="comment-reply-author">${reply.author}</div>
              <div class="comment-reply-timestamp">${new Date(reply.timestamp).toLocaleString()}</div>
            </div>
            <div class="comment-reply-content">${reply.text}</div>
          </div>
        `;
      });
      repliesHtml += '</div>';
    }

    commentElement.innerHTML = `
      <div class="comment-header">
        <div class="comment-author">${comment.author}</div>
        <div class="comment-timestamp">${new Date(comment.timestamp).toLocaleString()}</div>
      </div>
      <div class="comment-fragment" style="font-size: 12px; color: #6c757d; margin-bottom: 6px; font-style: italic;">
        To fragment: "${comment.content}"
      </div>
      <div class="comment-content">${comment.text}</div>
      ${repliesHtml}
      <div class="comment-actions">
        <button class="comment-action-btn resolve" title="Mark as resolved">
          ${comment.resolved ? '✓ Resolved' : '✓ Resolve'}
        </button>
        <button class="comment-action-btn reply" title="Reply to comment">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-text-icon lucide-message-square-text"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M7 11h10"/><path d="M7 15h6"/><path d="M7 7h8"/></svg> Reply</button>
        
        <button class="comment-action-btn delete" title="Delete comment"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>
    `;
    
    commentElement.dataset.commentId = comment.id;
    
    // Click handler for comment highlighting
    commentElement.addEventListener('click', (e) => {
      if (!e.target.classList.contains('comment-action-btn')) {
        highlightComment(comment.id);
      }
    });
    
    // Resolve button handler
    const resolveBtn = commentElement.querySelector('.resolve');
    resolveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCommentResolved(comment.id);
    });
    
    // Reply button handler
    const replyBtn = commentElement.querySelector('.reply');
    replyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startReply(comment.id, comment.text);
    });
    
    // Delete button handler
    const deleteBtn = commentElement.querySelector('.delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteComment(comment.id);
    });
    
    commentsList.appendChild(commentElement);
  });
}

// Function to restore comments on load
function restoreComments() {
  const existingComments = comments.filter(comment => {
    const elements = document.querySelectorAll(`[data-comment-id="${comment.id}"]`);
    return elements.length > 0;
  });
  
  if (existingComments.length !== comments.length) {
    comments = existingComments;
    localStorage.setItem('editor-comments', JSON.stringify(comments));
    renderComments();
  }
  
  // Update visual state of resolved comments
  comments.forEach(comment => {
    if (comment.resolved) {
      const commentElement = document.querySelector(`[data-comment-id="${comment.id}"]`);
      if (commentElement) {
        commentElement.classList.add('resolved');
      }
    }
    
    // Ensure all comments have replies array
    if (!comment.replies) {
      comment.replies = [];
    }
  });
}

// Function to highlight and scroll to comment
function highlightComment(commentId) {
  // Remove previous highlighting
  document.querySelectorAll('.comment-highlight').forEach(el => {
    el.classList.remove('comment-highlight');
  });
  
  const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
  if (commentElement) {
    // Highlight
    commentElement.classList.add('comment-highlight');
    
    // Find nearest Editor.js block
    const blockElement = commentElement.closest('.ce-block');
    if (blockElement) {
      // Scroll to block with smooth animation
      blockElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Add temporary highlighting to entire block
      blockElement.style.transition = 'background-color 0.3s';
      blockElement.style.backgroundColor = 'rgba(255, 235, 59, 0.2)';
      
      setTimeout(() => {
        blockElement.style.backgroundColor = '';
        commentElement.classList.remove('comment-highlight');
      }, 2000);
    }
  }
}

// Function to clean popup from random elements
function cleanPopup() {
  const popup = document.querySelector('.comment-popup');
  const unwantedElements = popup.querySelectorAll('.cdx-comment, .comment-highlight');
  unwantedElements.forEach(el => el.remove());
}

// Function to toggle comment resolved status
function toggleCommentResolved(commentId) {
  const comment = comments.find(c => c.id === commentId);
  if (comment) {
    comment.resolved = !comment.resolved;
    localStorage.setItem('editor-comments', JSON.stringify(comments));
    
    // Update visual display in editor
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentElement) {
      commentElement.classList.toggle('resolved', comment.resolved);
    }
    
    renderComments();
  }
}

// Function to start replying to comment
function startReply(commentId, commentText) {
  replyingTo = commentId;
  
  // Update popup
  document.getElementById('popup-title').textContent = 'Reply to comment';
  document.getElementById('reply-to-info').style.display = 'block';
  document.getElementById('reply-to-text').textContent = commentText.substring(0, 50) + (commentText.length > 50 ? '...' : '');
  document.getElementById('comment-text').placeholder = 'Write your reply...';
  
  // Show popup
  document.querySelector('.comment-popup').style.display = 'block';
  document.getElementById('comment-text').focus();
}

// Function to cancel reply
function cancelReply() {
  replyingTo = null;
  document.getElementById('popup-title').textContent = 'Add Comment';
  document.getElementById('reply-to-info').style.display = 'none';
  document.getElementById('comment-text').placeholder = 'Add comment...';
  document.getElementById('comment-text').value = '';
}

// Function to save reply
function saveReply() {
  const replyText = document.getElementById('comment-text').value.trim();
  
  if (!replyText || !replyingTo) {
    return;
  }
  
  // Find comment to reply to
  const comment = comments.find(c => c.id === replyingTo);
  if (!comment) {
    console.error('Comment not found');
    return;
  }
  
  // Add reply
  if (!comment.replies) {
    comment.replies = [];
  }
  
  comment.replies.push({
    id: Date.now(), // Simple ID for reply
    text: replyText,
    timestamp: new Date().toISOString(),
    author: 'User'
  });
  
  // Save to localStorage
  localStorage.setItem('editor-comments', JSON.stringify(comments));
  
  // Close popup
  document.querySelector('.comment-popup').style.display = 'none';
  cancelReply();
  
  // Update display
  renderComments();
}

// Function to delete comment
function deleteComment(commentId) {
  if (confirm('Are you sure you want to delete this comment?')) {
    // Remove from array
    comments = comments.filter(c => c.id !== commentId);
    localStorage.setItem('editor-comments', JSON.stringify(comments));
    
    // Remove element from DOM
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentElement) {
      commentElement.remove();
    }
    
    renderComments();
  }
}

// Event handlers
document.getElementById('save-comment').addEventListener('click', saveComment);
document.getElementById('cancel-comment').addEventListener('click', () => {
  document.querySelector('.comment-popup').style.display = 'none';
  document.getElementById('comment-text').value = '';
  cleanPopup();
  cancelReply();
});

// Cancel reply handler
document.getElementById('cancel-reply').addEventListener('click', () => {
  cancelReply();
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('cdx-comment')) {
    const commentId = e.target.getAttribute('data-comment-id');
    highlightComment(commentId);
  }
});

// Handle Enter key in popup
document.getElementById('comment-text').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    saveComment();
  }
}); 
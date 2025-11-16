<script>
  import { onMount } from 'svelte';
  
  export let initialCode = `console.log("Hello, World!");`;
  export let title = 'Live Code Editor';
  export let height = '500px';
  export let language = 'javascript'; // 'javascript', 'python', or 'html'

  let code = initialCode;
  let output = '';
  let error = '';
  let copied = false;

  onMount(() => {
    runCode();
  });

  function runCode() {
    error = '';
    output = '';

    if (language === 'html') {
      output = code;
    } else if (language === 'javascript') {
      try {
        const logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ')),
          error: (...args) => logs.push('ERROR: ' + args.join(' ')),
          warn: (...args) => logs.push('WARN: ' + args.join(' ')),
        };
        
        const func = new Function('console', code);
        func(customConsole);
        output = logs.join('\n') || '(no output)';
      } catch (e) {
        error = e.message;
      }
    } else if (language === 'python') {
      output = '⚠️ Python execution requires a backend server.\n\nYour code:\n' + code;
    }
  }

  function resetCode() {
    code = initialCode;
    runCode();
  }

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleInput(e) {
    code = e.target.value;
  }
</script>

<div class="editor-wrapper" style="--editor-height: {height}">
  <div class="editor-chrome">
    <div class="chrome-header">
      <div class="chrome-dots">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
      </div>
      <div class="chrome-title">{title}</div>
      <div class="chrome-actions">
        <button class="btn btn-ghost" on:click={copyCode} title="Copy code">
          {#if copied}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied</span>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          {/if}
        </button>
        <button class="btn btn-ghost" on:click={resetCode} title="Reset code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          <span>Reset</span>
        </button>
        <button class="btn btn-primary" on:click={runCode} title="Run code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Run</span>
        </button>
      </div>
    </div>

    <div class="editor-content">
      <div class="editor-pane">
        <div class="pane-label">
          <span class="label-text">CODE</span>
          <span class="label-lang">{language}</span>
        </div>
        <textarea 
          class="code-textarea"
          value={code}
          on:input={handleInput}
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
        ></textarea>
      </div>

      <div class="divider"></div>

      <div class="preview-pane">
        <div class="pane-label">
          <span class="label-text">{language === 'html' ? 'PREVIEW' : 'OUTPUT'}</span>
        </div>
        {#if language === 'html'}
          <iframe
            class="preview-frame"
            title="Preview"
            srcdoc={output}
            sandbox="allow-scripts"
          ></iframe>
        {:else}
          <div class="output-console">
            {#if error}
              <pre class="error-output">{error}</pre>
            {:else}
              <pre class="console-output">{output}</pre>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@500;600;700&display=swap');

  :root {
    --chrome-bg: #0a0e14;
    --chrome-border: #1a1f29;
    --editor-bg: #0d1117;
    --textarea-bg: #161b22;
    --preview-bg: #0d1117;
    --text-primary: #e6edf3;
    --text-secondary: #7d8590;
    --accent-primary: #f97316;
    --accent-secondary: #fb923c;
    --accent-tertiary: #fdba74;
    --dot-red: #ff5f56;
    --dot-yellow: #ffbd2e;
    --dot-green: #27c93f;
    --btn-hover: #1c2128;
    --error-color: #ef4444;
    --output-bg: #0a0e14;
  }

  .editor-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 2rem auto;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .editor-chrome {
    background: var(--chrome-bg);
    border: 1px solid var(--chrome-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 
      0 0 0 1px rgba(249, 115, 22, 0.1),
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 60px rgba(249, 115, 22, 0.15);
  }

  .chrome-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #0a0e14 0%, #1a1f29 100%);
    border-bottom: 1px solid var(--chrome-border);
  }

  .chrome-dots {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  .dot:hover {
    transform: scale(1.15);
  }

  .dot-red { background: var(--dot-red); }
  .dot-yellow { background: var(--dot-yellow); }
  .dot-green { background: var(--dot-green); }

  .chrome-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.025em;
  }

  .chrome-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border: none;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-secondary);
  }

  .btn-ghost:hover {
    background: var(--btn-hover);
    color: var(--text-primary);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .editor-content {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    height: var(--editor-height);
  }

  .editor-pane,
  .preview-pane {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.625rem 1rem;
    background: var(--editor-bg);
    border-bottom: 1px solid var(--chrome-border);
  }

  .label-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--accent-tertiary);
  }

  .label-lang {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .divider {
    background: linear-gradient(180deg, 
      var(--chrome-border) 0%, 
      var(--accent-primary) 50%, 
      var(--chrome-border) 100%);
    opacity: 0.5;
  }

  .code-textarea {
    flex: 1;
    width: 100%;
    padding: 1rem;
    background: var(--textarea-bg);
    border: none;
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    tab-size: 2;
  }

  .code-textarea::selection {
    background: rgba(249, 115, 22, 0.3);
  }

  .preview-frame {
    flex: 1;
    width: 100%;
    border: none;
    background: white;
  }

  .output-console {
    flex: 1;
    padding: 1rem;
    background: var(--output-bg);
    overflow: auto;
  }

  .console-output,
  .error-output {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8125rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .console-output {
    color: var(--accent-tertiary);
  }

  .error-output {
    color: var(--error-color);
  }

  @media (max-width: 768px) {
    .editor-content {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1px 1fr;
    }

    .divider {
      background: linear-gradient(90deg, 
        var(--chrome-border) 0%, 
        var(--accent-primary) 50%, 
        var(--chrome-border) 100%);
    }

    .chrome-title {
      display: none;
    }

    .btn span {
      display: none;
    }
  }
</style>
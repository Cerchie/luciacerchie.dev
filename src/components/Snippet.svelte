<script>
  export let code = '';
  export let language = 'javascript';
  export let filename = '';
  export let highlightLines = []; // Array of line numbers to highlight, e.g. [2, 3, 5]
  export let showLineNumbers = true;

  let copied = false;

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function getLanguageColor(lang) {
    const colors = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      rust: '#ce422b',
      go: '#00add8',
      java: '#b07219',
      html: '#e34c26',
      css: '#563d7c',
      svelte: '#ff3e00',
      react: '#61dafb',
      vue: '#42b883',
      sql: '#e38c00',
      shell: '#89e051',
      bash: '#89e051',
      json: '#292929',
    };
    return colors[lang.toLowerCase()] || '#6b7280';
  }

  $: lines = code.split('\n');
</script>

<div class="snippet-container">
  <div class="snippet-header">
    <div class="header-left">
      <div class="lang-badge" style="--lang-color: {getLanguageColor(language)}">
        <span class="lang-dot"></span>
        <span class="lang-name">{language}</span>
      </div>
      {#if filename}
        <div class="filename">{filename}</div>
      {/if}
    </div>
    <button class="copy-btn" on:click={copyCode} title="Copy code">
      {#if copied}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      {/if}
    </button>
  </div>

  <div class="snippet-code">
    <pre class="code-pre"><code class="code-block">{#each lines as line, i}
<span class="code-line" class:highlighted={highlightLines.includes(i + 1)}>
  {#if showLineNumbers}<span class="line-number">{i + 1}</span>{/if}<span class="line-content">{line}</span>
</span>{/each}</code></pre>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Archivo:wght@600;700&display=swap');

  :root {
    --snippet-bg: #0a0e14;
    --snippet-border: #1a4d3e;
    --header-bg: #0d3028;
    --line-highlight: #1a5a47;
    --line-number-color: #2d7a68;
    --text-color: #e0f2f1;
    --text-dim: #80cbc4;
    --copy-btn-bg: #1a5a47;
    --copy-btn-hover: #2d7a68;
    --shadow: rgba(10, 14, 20, 0.6);
    --accent-green: #26a69a;
  }

  .snippet-container {
    width: 100%;
    max-width: 900px;
    margin: 1.5rem auto;
    background: var(--snippet-bg);
    border: 1px solid var(--snippet-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px var(--shadow);
    font-family: 'Archivo', sans-serif;
  }

  .snippet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.875rem 1.25rem;
    background: var(--header-bg);
    border-bottom: 1px solid var(--snippet-border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .lang-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .lang-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--lang-color);
    box-shadow: 0 0 8px var(--lang-color);
  }

  .lang-name {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-color);
  }

  .filename {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-dim);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: var(--copy-btn-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: var(--text-color);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: var(--copy-btn-hover);
    transform: translateY(-1px);
  }

  .copy-btn svg {
    flex-shrink: 0;
  }

  .snippet-code {
    overflow-x: auto;
  }

  .code-pre {
    margin: 0;
    padding: 1rem 0;
  }

  .code-block {
    display: block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.375rem;
    line-height: 1.25;
    color: var(--text-color);
  }

  .code-line {
    display: flex;
    padding: 0 1.25rem;
    transition: background-color 0.15s ease;
  }

  .code-line.highlighted {
    background: var(--line-highlight);
    border-left: 3px solid var(--lang-color, #3b82f6);
  }

  .line-number {
    display: inline-block;
    width: 3em;
    margin-right: 1.5rem;
    color: var(--line-number-color);
    text-align: right;
    user-select: none;
    flex-shrink: 0;
  }

  .line-content {
    flex: 1;
    white-space: pre;
  }

  @media (max-width: 640px) {
    .snippet-container {
      border-radius: 8px;
      margin: 1rem 0;
    }

    .snippet-header {
      padding: 0.75rem 1rem;
    }

    .copy-btn span {
      display: none;
    }

    .filename {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .code-block {
      font-size: 0.75rem;
      line-height: 1.3;
    }

    .code-pre {
      padding: 0.5rem 0.5rem;
      margin: 1rem 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      max-width: 100%;
    }

    .code-line {
      padding: 0 0.5rem;
    }

    .line-number {
      display: none;
    }

    .snippet-header {
      padding: 0.5rem 0.75rem;
    }

    .header-left {
      gap: 0.5rem;
    }

    .lang-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.65rem;
    }

    .copy-btn {
      padding: 0.375rem 0.625rem;
      font-size: 0.7rem;
    }
  }
</style>
<script>
  import { onMount } from 'svelte';
  
  export let title = 'Interactive Diagram';
  export let nodes = []; // Array of {id, x, y, label, color, shape}
  export let connections = []; // Array of {from, to, label, animated}
  export let width = '800px';
  export let height = '500px';
  export let draggable = true;
  export let autoPlay = false;
  export let steps = []; // Array of animation steps

  let svg;
  let draggedNode = null;
  let dragOffset = { x: 0, y: 0 };
  let currentStep = 0;
  let isPlaying = false;
  let playInterval;

  // Initialize node positions if not provided
  let nodeData = nodes.map((node, i) => ({
    id: node.id || `node-${i}`,
    x: node.x ?? 100 + (i % 3) * 200,
    y: node.y ?? 100 + Math.floor(i / 3) * 150,
    label: node.label || `Node ${i + 1}`,
    color: node.color || '#3b82f6',
    shape: node.shape || 'circle',
    size: node.size || 60,
    ...node
  }));

  let connectionData = connections.map((conn, i) => ({
    id: `conn-${i}`,
    from: conn.from,
    to: conn.to,
    label: conn.label || '',
    animated: conn.animated ?? false,
    style: conn.style || 'solid',
    color: conn.color || '#64748b',
    ...conn
  }));

  onMount(() => {
    if (autoPlay && steps.length > 0) {
      play();
    }
  });

  function handleMouseDown(node, event) {
    if (!draggable) return;
    draggedNode = node;
    const rect = svg.getBoundingClientRect();
    dragOffset.x = event.clientX - rect.left - node.x;
    dragOffset.y = event.clientY - rect.top - node.y;
  }

  function handleMouseMove(event) {
    if (!draggedNode || !draggable) return;
    const rect = svg.getBoundingClientRect();
    draggedNode.x = event.clientX - rect.left - dragOffset.x;
    draggedNode.y = event.clientY - rect.top - dragOffset.y;
    nodeData = nodeData;
  }

  function handleMouseUp() {
    draggedNode = null;
  }

  function getConnectionPath(conn) {
    const fromNode = nodeData.find(n => n.id === conn.from);
    const toNode = nodeData.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    
    const fromRadius = fromNode.size / 2;
    const toRadius = toNode.size / 2;
    
    const startX = fromNode.x + Math.cos(angle) * fromRadius;
    const startY = fromNode.y + Math.sin(angle) * fromRadius;
    const endX = toNode.x - Math.cos(angle) * toRadius;
    const endY = toNode.y - Math.sin(angle) * toRadius;

    if (conn.curved) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const offset = 30;
      const controlX = midX - dy / Math.sqrt(dx * dx + dy * dy) * offset;
      const controlY = midY + dx / Math.sqrt(dx * dx + dy * dy) * offset;
      return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    }
    
    return `M ${startX} ${startY} L ${endX} ${endY}`;
  }

  function getArrowPoints(conn) {
    const fromNode = nodeData.find(n => n.id === conn.from);
    const toNode = nodeData.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return '';

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const angle = Math.atan2(dy, dx);
    const toRadius = toNode.size / 2;
    
    const endX = toNode.x - Math.cos(angle) * toRadius;
    const endY = toNode.y - Math.sin(angle) * toRadius;
    
    const arrowSize = 10;
    const angle1 = angle + Math.PI * 0.8;
    const angle2 = angle - Math.PI * 0.8;
    
    const x1 = endX + Math.cos(angle1) * arrowSize;
    const y1 = endY + Math.sin(angle1) * arrowSize;
    const x2 = endX + Math.cos(angle2) * arrowSize;
    const y2 = endY + Math.sin(angle2) * arrowSize;
    
    return `${endX},${endY} ${x1},${y1} ${x2},${y2}`;
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      applyStep(steps[currentStep]);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      applyStep(steps[currentStep]);
    }
  }

  function resetSteps() {
    currentStep = 0;
    if (steps.length > 0) {
      applyStep(steps[0]);
    }
  }

  function play() {
    if (steps.length === 0) return;
    isPlaying = true;
    resetSteps();
    playInterval = setInterval(() => {
      if (currentStep >= steps.length - 1) {
        pause();
      } else {
        nextStep();
      }
    }, 1500);
  }

  function pause() {
    isPlaying = false;
    clearInterval(playInterval);
  }

  function applyStep(step) {
    if (step.highlight) {
      nodeData = nodeData.map(node => ({
        ...node,
        highlighted: step.highlight.includes(node.id)
      }));
    }
    if (step.animate) {
      connectionData = connectionData.map(conn => ({
        ...conn,
        active: step.animate.some(a => 
          (a.from === conn.from && a.to === conn.to) ||
          a === `${conn.from}-${conn.to}`
        )
      }));
    }
  }

  function getNodeShape(node) {
    const size = node.size;
    const halfSize = size / 2;
    
    switch(node.shape) {
      case 'square':
        return `M ${node.x - halfSize} ${node.y - halfSize} 
                L ${node.x + halfSize} ${node.y - halfSize} 
                L ${node.x + halfSize} ${node.y + halfSize} 
                L ${node.x - halfSize} ${node.y + halfSize} Z`;
      case 'diamond':
        return `M ${node.x} ${node.y - halfSize} 
                L ${node.x + halfSize} ${node.y} 
                L ${node.x} ${node.y + halfSize} 
                L ${node.x - halfSize} ${node.y} Z`;
      case 'hexagon':
        const angles = [0, 60, 120, 180, 240, 300];
        const hexPoints = angles.map(angle => {
          const rad = (angle * Math.PI) / 180;
          return [
            node.x + halfSize * Math.cos(rad),
            node.y + halfSize * Math.sin(rad)
          ];
        });
        const pathStr = hexPoints.map((point, i) => 
          `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`
        ).join(' ') + ' Z';
        return pathStr;
      default: // circle
        return '';
    }
  }
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div class="diagram-wrapper" style="--diagram-width: {width}; --diagram-height: {height};">
  <div class="diagram-container">
    <div class="diagram-header">
      <h3 class="diagram-title">{title}</h3>
      {#if steps.length > 0}
        <div class="controls">
          <button 
            class="control-btn" 
            on:click={resetSteps}
            title="Reset"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
          <button 
            class="control-btn" 
            on:click={prevStep}
            disabled={currentStep === 0}
            title="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          {#if isPlaying}
            <button class="control-btn primary" on:click={pause} title="Pause">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            </button>
          {:else}
            <button class="control-btn primary" on:click={play} title="Play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          {/if}
          <button 
            class="control-btn" 
            on:click={nextStep}
            disabled={currentStep === steps.length - 1}
            title="Next"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <span class="step-indicator">{currentStep + 1} / {steps.length}</span>
        </div>
      {/if}
    </div>

    <svg 
      bind:this={svg}
      class="diagram-svg"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#64748b" />
        </marker>
      </defs>

      <!-- Connections -->
      <g class="connections">
        {#each connectionData as conn (conn.id)}
          <g class="connection" class:active={conn.active}>
            <path
              d={getConnectionPath(conn)}
              stroke={conn.color}
              stroke-width="2.5"
              fill="none"
              stroke-dasharray={conn.style === 'dashed' ? '8,4' : '0'}
              class:animated-path={conn.animated || conn.active}
            />
            <polygon
              points={getArrowPoints(conn)}
              fill={conn.color}
              class:animated-arrow={conn.animated || conn.active}
            />
            {#if conn.label}
              <text
                x={(nodeData.find(n => n.id === conn.from)?.x + nodeData.find(n => n.id === conn.to)?.x) / 2}
                y={(nodeData.find(n => n.id === conn.from)?.y + nodeData.find(n => n.id === conn.to)?.y) / 2 - 10}
                class="connection-label"
                text-anchor="middle"
              >
                {conn.label}
              </text>
            {/if}
          </g>
        {/each}
      </g>

      <!-- Nodes -->
      <g class="nodes">
        {#each nodeData as node (node.id)}
          <g 
            class="node"
            class:highlighted={node.highlighted}
            class:draggable
            on:mousedown={(e) => handleMouseDown(node, e)}
            style="cursor: {draggable ? 'move' : 'default'}"
          >
            {#if node.shape === 'circle'}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size / 2}
                fill={node.color}
                class="node-shape"
              />
            {:else}
              <path
                d={getNodeShape(node)}
                fill={node.color}
                class="node-shape"
              />
            {/if}
            <text
              x={node.x}
              y={node.y}
              class="node-label"
              text-anchor="middle"
              dominant-baseline="middle"
            >
              {node.label}
            </text>
          </g>
        {/each}
      </g>
    </svg>

    {#if steps.length > 0 && steps[currentStep]?.description}
      <div class="step-description">
        {steps[currentStep].description}
      </div>
    {/if}
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

  :root {
    --diagram-bg: #fafafa;
    --diagram-border: #e5e5e5;
    --header-bg: #ffffff;
    --text-primary: #171717;
    --text-secondary: #737373;
    --accent: #14b8a6;
    --accent-light: #5eead4;
    --accent-dark: #0f766e;
    --shadow-color: rgba(20, 184, 166, 0.15);
  }

  .diagram-wrapper {
    width: 100%;
    max-width: var(--diagram-width);
    margin: 2rem auto;
    font-family: 'Darker Grotesque', sans-serif;
  }

  .diagram-container {
    background: var(--diagram-bg);
    border: 2px solid var(--diagram-border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.08),
      0 0 0 1px var(--shadow-color);
  }

  .diagram-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--header-bg);
    border-bottom: 2px solid var(--diagram-border);
  }

  .diagram-title {
    margin: 0;
    font-size: 1.375rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 2px solid var(--diagram-border);
    border-radius: 8px;
    background: white;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    transform: translateY(-1px);
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .control-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .control-btn.primary:hover {
    background: var(--accent-dark);
    border-color: var(--accent-dark);
  }

  .step-indicator {
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding: 0 0.5rem;
  }

  .diagram-svg {
    width: 100%;
    height: var(--diagram-height);
    display: block;
  }

  .node {
    transition: transform 0.2s ease;
  }

  .node.draggable {
    cursor: move;
  }

  .node:hover .node-shape {
    filter: brightness(1.1);
  }

  .node.highlighted .node-shape {
    filter: url(#glow) brightness(1.15);
    stroke: var(--accent-light);
    stroke-width: 3;
    animation: pulse 1s ease-in-out infinite;
  }

  .node-shape {
    transition: all 0.3s ease;
  }

  .node-label {
    font-family: 'Darker Grotesque', sans-serif;
    font-size: 16px;
    font-weight: 700;
    fill: white;
    pointer-events: none;
    user-select: none;
  }

  .connection-label {
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    font-weight: 500;
    fill: var(--text-secondary);
    pointer-events: none;
  }

  .connection.active path {
    stroke: var(--accent);
    stroke-width: 3;
  }

  .connection.active polygon {
    fill: var(--accent);
  }

  .animated-path {
    stroke-dasharray: 8;
    animation: dash 1s linear infinite;
  }

  .animated-arrow {
    animation: pulse 1s ease-in-out infinite;
  }

  .step-description {
    padding: 1rem 1.5rem;
    background: white;
    border-top: 2px solid var(--diagram-border);
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.6;
    color: var(--text-primary);
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -16;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  @media (max-width: 768px) {
    .diagram-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .controls {
      justify-content: center;
    }
  }
</style>
/** Shared styles for module pages */
export const MODULO_PAGE_STYLES = `
  .page { padding: 24px 28px 48px; max-width: 1200px; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .page-header h1 { margin: 0; font-size: 1.5rem; letter-spacing: -0.02em; }
  .page-header p { margin: 6px 0 0; color: var(--clx-text-muted); font-size: .9rem; }
  .badge-demo {
    display: inline-flex; align-items: center; gap: 6px;
    background: color-mix(in srgb, var(--clx-accent) 15%, transparent);
    color: var(--clx-accent); font-size: .75rem; font-weight: 700;
    padding: 4px 10px; border-radius: 999px; margin-left: 8px;
  }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .card-kpi {
    background: var(--clx-bg); border: 1px solid var(--clx-border); border-radius: 8px;
    padding: 14px 16px; box-shadow: var(--clx-shadow, 0 2px 12px rgba(0,0,0,.04));
  }
  .card-kpi .label { font-size: .75rem; color: var(--clx-text-muted); font-weight: 600; }
  .card-kpi .value { font-size: 1.25rem; font-weight: 800; margin-top: 4px; }
  .panel {
    background: var(--clx-bg); border: 1px solid var(--clx-border); border-radius: 10px;
    padding: 16px; margin-bottom: 16px;
  }
  .panel h3 { margin: 0 0 12px; font-size: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: .88rem; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid var(--clx-border); vertical-align: top; }
  th { color: var(--clx-text-muted); font-size: .75rem; text-transform: uppercase; letter-spacing: .04em; }
  .btn-primary, .btn-secondary, .btn-sm {
    border: 0; border-radius: 10px; cursor: pointer; font-weight: 600;
  }
  .btn-primary {
    background: var(--clx-accent); color: #fff; padding: 10px 14px; font-size: .88rem;
  }
  .btn-secondary {
    background: color-mix(in srgb, var(--clx-accent) 12%, transparent);
    color: var(--clx-text); padding: 10px 14px; font-size: .88rem;
  }
  .btn-sm { padding: 6px 10px; font-size: .78rem; background: var(--clx-bg-alt); border: 1px solid var(--clx-border); }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
  .form-grid label { display: flex; flex-direction: column; gap: 4px; font-size: .78rem; font-weight: 600; color: var(--clx-text-muted); }
  .form-grid input, .form-grid select, .form-grid textarea {
    border: 1px solid var(--clx-border); border-radius: 10px; padding: 8px 10px;
    background: var(--clx-bg-alt); font-size: .9rem;
  }
  .form-grid textarea { min-height: 80px; resize: vertical; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .empty { color: var(--clx-text-muted); padding: 24px; text-align: center; }
  .tag {
    display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: .72rem; font-weight: 700;
    background: var(--clx-bg-alt); color: var(--clx-text-muted);
  }
  .tag--ok { background: #d1fae5; color: #065f46; }
  .tag--warn { background: #fef3c7; color: #92400e; }
  .tag--err { background: #fee2e2; color: #991b1b; }
  .tag--info { background: #dbeafe; color: #1e40af; }
  .chat-layout { display: grid; grid-template-columns: 280px 1fr; gap: 12px; min-height: 420px; }
  @media (max-width: 800px) { .chat-layout { grid-template-columns: 1fr; } }
  .conv-list { border: 1px solid var(--clx-border); border-radius: 12px; overflow: auto; max-height: 480px; }
  .conv-item {
    padding: 12px; border-bottom: 1px solid var(--clx-border); cursor: pointer;
  }
  .conv-item:hover, .conv-item.active { background: color-mix(in srgb, var(--clx-accent) 10%, transparent); }
  .msg-box {
    border: 1px solid var(--clx-border); border-radius: 12px; display: flex; flex-direction: column;
    min-height: 420px;
  }
  .msgs { flex: 1; padding: 12px; overflow: auto; display: flex; flex-direction: column; gap: 8px; }
  .msg {
    max-width: 75%; padding: 8px 12px; border-radius: 12px; font-size: .88rem; line-height: 1.4;
  }
  .msg.out { align-self: flex-end; background: color-mix(in srgb, var(--clx-accent) 20%, transparent); }
  .msg.in { align-self: flex-start; background: var(--clx-bg-alt); }
  .composer { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--clx-border); }
  .composer input { flex: 1; border: 1px solid var(--clx-border); border-radius: 10px; padding: 10px; }
  .muted { color: var(--clx-text-muted); font-size: .8rem; }
  .result-box {
    white-space: pre-wrap; background: var(--clx-bg-alt); border-radius: 12px; padding: 14px;
    border: 1px solid var(--clx-border); font-size: .9rem; line-height: 1.5;
  }

  @media (max-width: 700px) {
    .page { padding: 16px 12px 32px; }
    .page-header { flex-direction: column; align-items: stretch; gap: 10px; }
    .page-header h1 { font-size: 1.2rem; }
    .cards { grid-template-columns: 1fr 1fr; gap: 8px; }
    .card-kpi { padding: 10px 12px; }
    .card-kpi .value { font-size: 1rem; }
    .panel { padding: 12px; }
    table { font-size: .78rem; }
    th, td { padding: 8px 6px; }
    .form-grid { grid-template-columns: 1fr; }
    .chat-layout { grid-template-columns: 1fr; min-height: auto; }
  }
  @media (max-width: 450px) {
    .cards { grid-template-columns: 1fr; }
    .page-header h1 { font-size: 1.1rem; }
    .btn-primary, .btn-secondary { padding: 8px 10px; font-size: .8rem; }
  }
`;

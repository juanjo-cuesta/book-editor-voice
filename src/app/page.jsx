'use client';
import { useState, useRef, useEffect } from 'react';

const STORAGE_KEY = 'book_editor_config';

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveConfig(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function BookEditor() {
  const [filePath, setFilePath] = useState(() => {
    try {
      return typeof window !== 'undefined'
        ? localStorage.getItem('book_editor_path') || 'libro.md'
        : 'libro.md';
    } catch { return 'libro.md'; }
  });
  const [content, setContent] = useState('');
  const [instruction, setInstruction] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sha, setSha] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem('book_editor_path', filePath); } catch {}
  }, [filePath]);

  const fetchFile = async () => {
    setLoading(true);
    setStatus('Cargando archivo de GitHub...');
    try {
      const res = await fetch(`/api/github?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.content);
      setSha(data.sha);
      setStatus('✓ Archivo cargado');
    } catch (e) {
      setStatus(`✗ Error: ${e.message}`);
    }
    setLoading(false);
  };

  const applyInstruction = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setStatus('Claude editando...');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, instruction })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent(data.result);
      setInstruction('');
      setStatus('✓ Edición aplicada — revisa y guarda cuando quieras');
    } catch (e) {
      setStatus(`✗ Error: ${e.message}`);
    }
    setLoading(false);
  };

  const saveToGitHub = async () => {
    setLoading(true);
    setStatus('Guardando en GitHub...');
    try {
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content,
          sha,
          message: `✏️ Book edit: ${instruction || 'manual update'}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSha(data.sha);
      setStatus('✓ Guardado en GitHub');
    } catch (e) {
      setStatus(`✗ Error: ${e.message}`);
    }
    setLoading(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setStatus('⚠️ Tu navegador no soporta reconocimiento de voz'); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'es-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInstruction(prev => prev ? prev + ' ' + text : text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#e8e0d0', fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #2a2a2a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, letterSpacing: 3, fontWeight: 300, color: '#c8b89a' }}>✦ LIBRO</span>
          <span style={{ fontSize: 11, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>editor con IA</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPreview(!preview)}
            style={{ padding: '6px 14px', background: preview ? '#c8b89a22' : 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            {preview ? '✏️ Editar' : '👁 Preview'}
          </button>
          <button onClick={() => setShowConfig(!showConfig)}
            style={{ padding: '6px 14px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            ⚙️ Config
          </button>
        </div>
      </div>

      {showConfig && (
        <div style={{ background: '#161616', borderBottom: '1px solid #2a2a2a', padding: '20px 24px', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Ruta del archivo</div>
            <input
              type="text"
              value={filePath}
              onChange={e => setFilePath(e.target.value)}
              placeholder="libro.md"
              style={{ width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#e8e0d0', padding: '8px 10px', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
          <button onClick={fetchFile} disabled={loading}
            style={{ padding: '8px 20px', background: '#c8b89a', color: '#0f0f0f', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Cargar archivo
          </button>
        </div>
      )}

      {/* Status bar */}
      {status && (
        <div style={{ padding: '8px 24px', background: '#161616', borderBottom: '1px solid #2a2a2a', fontSize: 12, color: status.startsWith('✓') ? '#6a9955' : status.startsWith('✗') ? '#f44' : '#c8b89a' }}>
          {loading && <span style={{ marginRight: 8 }}>⟳</span>}{status}
        </div>
      )}

      {/* Main area */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        {/* Text area */}
        <div style={{ flex: 1, padding: '0 24px', overflow: 'auto' }}>
          {!content && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: '#444' }}>
              <div style={{ fontSize: 48 }}>📖</div>
              <div style={{ fontSize: 14, letterSpacing: 1 }}>Carga tu libro para empezar</div>
              <button onClick={fetchFile}
                style={{ padding: '10px 24px', background: '#c8b89a', color: '#0f0f0f', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                Cargar libro.md
              </button>
            </div>
          )}
          {content && !preview && (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#e8e0d0', fontSize: 15, lineHeight: 1.8, resize: 'none', fontFamily: "'Georgia', serif", padding: '24px 0' }}
            />
          )}
          {content && preview && (
            <div style={{ padding: '24px 0', maxWidth: 720, lineHeight: 1.9, fontSize: 15 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          )}
        </div>

        {/* Instruction bar */}
        <div style={{ borderTop: '1px solid #2a2a2a', padding: '16px 24px', background: '#0f0f0f', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), applyInstruction())}
              placeholder="Ej: Añade un personaje llamado Elena en la sección de personajes..."
              rows={2}
              style={{ width: '100%', background: '#161616', border: '1px solid #2a2a2a', color: '#e8e0d0', padding: '10px 14px', borderRadius: 6, fontSize: 14, resize: 'none', fontFamily: "'Georgia', serif", outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              style={{ padding: '10px 16px', background: listening ? '#c8b89a' : '#1e1e1e', color: listening ? '#0f0f0f' : '#888', border: '1px solid #333', borderRadius: 6, cursor: 'pointer', fontSize: 18, transition: 'all .2s' }}>
              {listening ? '🔴' : '🎙️'}
            </button>
            <button onClick={applyInstruction} disabled={loading || !instruction.trim() || !content}
              style={{ padding: '10px 16px', background: '#c8b89a', color: '#0f0f0f', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: (!instruction.trim() || !content) ? 0.4 : 1 }}>
              ✦ Aplicar
            </button>
          </div>
          {content && (
            <button onClick={saveToGitHub} disabled={loading}
              style={{ padding: '10px 16px', background: 'transparent', color: '#6a9955', border: '1px solid #6a9955', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
              ↑ GitHub
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3 style="color:#c8b89a;margin-top:1.5em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#c8b89a;margin-top:2em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#c8b89a;margin-top:2em">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l])/gm, '')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
}
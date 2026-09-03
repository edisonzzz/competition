import { useState, useEffect, useRef } from 'react';
import { LinuxTerminal } from '../utils/terminal';

export default function TerminalEmbedded({ compact }) {
  const [terminal] = useState(() => new LinuxTerminal());
  const [output, setOutput] = useState([
    { type: 'info', content: 'Linux Terminal Emulator v1.0' },
    { type: 'info', content: 'Type "help" for available commands' },
    { type: 'info', content: '' }
  ]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setOutput(prev => [...prev, {
      type: 'command',
      content: `${terminal.currentPath} $ ${input}`
    }]);
    const result = terminal.execute(input);
    if (result === '__CLEAR__') {
      setOutput([]);
    } else if (result) {
      setOutput(prev => [...prev, { type: 'output', content: result }]);
    }
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminal.history.length > 0) {
        const newIndex = historyIndex < terminal.history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(terminal.history[terminal.history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(terminal.history[terminal.history.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={outputRef} className="flex-1 bg-black p-3 overflow-y-auto font-mono text-xs">
        {output.map((line, index) => (
          <div key={index} className="mb-0.5">
            {line.type === 'command' && <div className="text-green-400">{line.content}</div>}
            {line.type === 'output' && <pre className="text-gray-300 whitespace-pre-wrap">{line.content}</pre>}
            {line.type === 'info' && <div className="text-blue-400">{line.content}</div>}
          </div>
        ))}
      </div>
      <form onSubmit={handleCommand} className="bg-black px-3 py-2 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono text-xs">{terminal.currentPath} $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white font-mono text-xs outline-none"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </form>
    </div>
  );
}
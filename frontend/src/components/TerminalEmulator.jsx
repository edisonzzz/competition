import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { LinuxTerminal } from '../utils/terminal';

export default function TerminalEmulator({ onClose, challengeId }) {
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

    // 添加命令到输出
    setOutput(prev => [...prev, {
      type: 'command',
      content: `${terminal.currentPath} $ ${input}`
    }]);

    // 执行命令
    const result = terminal.execute(input);

    if (result === '__CLEAR__') {
      setOutput([]);
    } else if (result) {
      setOutput(prev => [...prev, {
        type: 'output',
        content: result
      }]);
    }

    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (terminal.history.length > 0) {
        const newIndex = historyIndex < terminal.history.length - 1
          ? historyIndex + 1
          : historyIndex;
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // 简单的自动补全
      const commands = ['ls', 'cd', 'cat', 'pwd', 'history', 'ps', 'netstat', 'whoami', 'clear', 'help'];
      const match = commands.find(cmd => cmd.startsWith(input));
      if (match) {
        setInput(match);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* 终端标题栏 */}
        <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-green-400" />
            <span className="text-white font-mono text-sm">admin@blueteam-challenge:~</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 终端输出区域 */}
        <div
          ref={outputRef}
          className="flex-1 bg-black p-4 overflow-y-auto font-mono text-sm"
        >
          {output.map((line, index) => (
            <div key={index} className="mb-1">
              {line.type === 'command' && (
                <div className="text-green-400">{line.content}</div>
              )}
              {line.type === 'output' && (
                <pre className="text-gray-300 whitespace-pre-wrap">{line.content}</pre>
              )}
              {line.type === 'info' && (
                <div className="text-blue-400">{line.content}</div>
              )}
            </div>
          ))}
        </div>

        {/* 终端输入区域 */}
        <form onSubmit={handleCommand} className="bg-black px-4 py-3 rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-mono text-sm">
              {terminal.currentPath} $
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-white font-mono text-sm outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </form>

        {/* 提示信息 */}
        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono">
          💡 Tip: Use history to view command history | Tab to autocomplete | ↑↓ to switch history
        </div>
      </div>
    </div>
  );
}

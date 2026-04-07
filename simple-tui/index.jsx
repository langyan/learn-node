import React, {useEffect, useState} from 'react';
import {Box, Text, render, useApp, useInput, useStdin} from 'ink';

const items = ['查看状态', '执行任务', '帮助'];

function InteractiveMenu({
  selected,
  setSelected,
  setLastAction,
  inputMode,
  setInputMode,
  inputValue,
  setInputValue,
  setSubmittedValue
}) {
  const {exit} = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
      return;
    }

    if (inputMode) {
      if (key.escape) {
        setInputMode(false);
        setInputValue('');
        setLastAction('已取消输入');
        return;
      }

      if (key.return) {
        const value = inputValue.trim();
        if (value.length > 0) {
          setSubmittedValue(value);
          setLastAction(`已提交输入：${value}`);
        } else {
          setLastAction('输入为空，未提交');
        }
        setInputValue('');
        setInputMode(false);
        return;
      }

      if (key.backspace || key.delete) {
        setInputValue((prev) => prev.slice(0, -1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setInputValue((prev) => prev + input);
      }
      return;
    }

    if (input === 'i') {
      setInputMode(true);
      setLastAction('进入输入模式，按 Enter 提交，Esc 取消');
      return;
    }

    if (key.upArrow) {
      setSelected((prev) => (prev - 1 + items.length) % items.length);
      return;
    }

    if (key.downArrow) {
      setSelected((prev) => (prev + 1) % items.length);
      return;
    }

    if (key.return) {
      setLastAction(`已执行：${items[selected]}`);
    }
  });

  return null;
}

function App() {
  const {exit} = useApp();
  const {isRawModeSupported} = useStdin();
  const [selected, setSelected] = useState(0);
  const [lastAction, setLastAction] = useState('尚未执行任何操作');
  const [inputMode, setInputMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState('暂无输入结果');

  useEffect(() => {
    if (!isRawModeSupported) {
      setLastAction('检测到非交互终端，程序将在 1 秒后退出。');
      const timer = setTimeout(() => exit(), 1000);
      return () => clearTimeout(timer);
    }
  }, [exit, isRawModeSupported]);

  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green">Simple TUI (Node + React + Ink)</Text>
      <Text dimColor>--------------------------------</Text>
      <Text>菜单模式：↑/↓ 选择，Enter 执行，i 输入，q 退出。</Text>
      <Text>输入模式：键入文本，Enter 提交，Esc 取消。</Text>
      {isRawModeSupported && (
        <InteractiveMenu
          selected={selected}
          setSelected={setSelected}
          setLastAction={setLastAction}
          inputMode={inputMode}
          setInputMode={setInputMode}
          inputValue={inputValue}
          setInputValue={setInputValue}
          setSubmittedValue={setSubmittedValue}
        />
      )}
      <Box flexDirection="column" marginTop={1}>
        {items.map((item, index) => (
          <Text key={`${index}-${item}`} color={index === selected ? 'cyan' : undefined}>
            {index === selected ? '>' : ' '} {item}
          </Text>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">当前选中：{items[selected]}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={inputMode ? 'cyan' : 'gray'}>
          输入框：{inputMode ? `${inputValue}_` : '(按 i 进入输入模式)'}
        </Text>
      </Box>
      <Box>
        <Text color="blue">输入结果：{submittedValue}</Text>
      </Box>
      <Box>
        <Text color="magenta">{lastAction}</Text>
      </Box>
    </Box>
  );
}

render(<App />);

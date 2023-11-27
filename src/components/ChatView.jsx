import { useState, useRef, useEffect, useContext } from 'react';
import Message from './Message';
import { ChatContext } from '../context/chatContext';
import Thinking from './Thinking';
import { MdSend } from 'react-icons/md';
import { replaceProfanities } from 'no-profanity';
import { rag_consult } from '../utils/medical_agent';


const options = {'qa': '问答', 'agent': "主动式对话", 'risk': '风险评估'};
const template = [
  {
    title: '主动式问诊案例',
    prompt: '我想知道我是否有心力衰竭？',
    queryType: 'agent'
  },
  {
    title: '多轮问答案例',
    prompt: '请问高血压应该注意吃什么？',
    queryType: "qa"
  },
  {
    title: '风险预警评估案例',
    prompt: 'TBD',
    queryType: 'risk'
  }
];

/**
 * A chat view component that displays a list of messages and a form for sending new messages.
 */
const ChatView = () => {
  const messagesEndRef = useRef();
  const inputRef = useRef();
  const [formValue, setFormValue] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, knowledge, addMessage, setKnowledge] = useContext(ChatContext);
  const [queryType, setQueryType] = useState('qa');
  const [queryChangeable, setQueryTypeChangeable] = useState(false);

  /**
   * Scrolls the chat area to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Adds a new message to the chat.
   *
   * @param {string} newValue - The text of the new message.
   * @param {boolean} [ai=false] - Whether the message was sent by an AI or the user.
   */
  const updateMessage = (newValue, ai = false) => {
    const id = Date.now();
    const newMsg = {
      id: id,
      createdAt: Date.now(),
      text: newValue,
      ai: ai,
      queryType: `${queryType}`,
    };

    addMessage(newMsg);
  };


  const sendMessage = async (e) => {
    e.preventDefault();
    const cleanPrompt = replaceProfanities(formValue);
    const newMsg = cleanPrompt;
    setThinking(true);
    setFormValue('');
    updateMessage(newMsg, false);

    try {
      let response = await rag_consult(cleanPrompt, messages, queryType, setKnowledge);
      updateMessage(response, true);
    } catch (err) {
      window.alert(`Error: ${err} please try again later`);
    }
    setThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // 👇 Get input value
      sendMessage(e);
    }
  };

  /**
   * Scrolls the chat area to the bottom when the messages array is updated.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  /**
   * Focuses the TextArea input to when the component is first rendered.
   */
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(()=>{
    if(messages.length>0){
      setQueryTypeChangeable(true)
    }
    if(messages.length==0){
      setQueryTypeChangeable(false)
    } 
  }, [messages])

  return (
    <main className='relative flex h-screen p-1 overflow-hidden dark:bg-light-grey'>
      <div className='flex flex-col w-3/4 h-full'>
      <section className='flex flex-col flex-grow w-full overflow-y-scroll px-4 sm:px-10 md:px-32'>
        {messages.length ? (
          messages.map((message, index) => (
            <Message key={index} message={{ ...message }} />
          ))
        ) : (
          <div className='flex my-2'>
            <div className='w-screen overflow-hidden'>
              <ul className='grid grid-cols-2 gap-2 mx-10'>
                {template.map((item, index) => (
                  <li
                    onClick={() => {
                      setFormValue(item.prompt); 
                      if(messages.length == 0) {setQueryType(item.queryType)}
                    }}
                    key={index}
                    className='p-6 border rounded-lg border-slate-300 hover:border-slate-500'>
                    <p className='text-base font-semibold'>{item.title}</p>
                    <p className='text-sm'>{item.prompt}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {thinking && <Thinking />}
        <span ref={messagesEndRef}></span>
      </section>
      <form
        className='flex flex-col px-10 mb-2 md:px-32 join sm:flex-row'
        onSubmit={sendMessage}>
        <select
          value={options[queryType]}
          onChange={(e) => setQueryType(e.target.id)}
          disabled={queryChangeable}
          className='w-full sm:w-40 select select-bordered join-item'>
          <option id={'qa'}>{options['qa']}</option>
          <option id={'agent'}>{options['agent']}</option>
          <option id={'risk'} disabled={true}>{options['risk']}</option>
        </select>
        <div className='flex items-stretch justify-between w-full'>
          <textarea
            ref={inputRef}
            className='w-full grow input input-bordered join-item max-h-[20rem] min-h-[3rem]'
            value={formValue}
            onKeyDown={handleKeyDown}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button type='submit' className='join-item btn' disabled={thinking}>
            <MdSend size={30} />
          </button>
        </div>
      </form>
      </div>
      <div className='flex flex-col w-1/4 h-full'>
        <h1>{knowledge}</h1>
      </div>
    </main>
  );
};

export default ChatView;

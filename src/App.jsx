import { ChatContextProvider } from './context/chatContext';
import SideBar from './components/SideBar';
import ChatView from './components/ChatView';


const App = () => {
  return (
    <ChatContextProvider>
      <div className='flex transition duration-500 ease-in-out'>
        <div className='flex-none'> {/* 或 flex-shrink-0 */}
          <SideBar />
        </div>
        <ChatView />
      </div>
    </ChatContextProvider>
  );
};

export default App;

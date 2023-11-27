import { data } from "autoprefixer";

const remote_url = 'http://10.5.29.170:8000'
const llm_model = 'baichuan2-13b-chat'
const embedding_model = "corom-chinese-medical"


// rag means retrieve augmented generation
export const rag_consult = async (input, history, query_type, setKnowledge) => {
    let target_url = '';
    if (query_type === 'qa') {
        target_url = `${remote_url}/rag_qa/${llm_model}/${embedding_model}`;
    } else if (query_type === 'agent') {
        target_url = `${remote_url}/rag_agent/${llm_model}/${embedding_model}`;
    } else {
        console.error('Invalid query type');
        return;
    }

    const payload = {
        'input': input,
        'history': history.map(item => item['text']),
    };

    try {
        const response = await fetch(target_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        const system_utterance = responseData['response'];
        const backgroundKnowledge = responseData['background_knowledge'];

        setKnowledge(backgroundKnowledge);

        return system_utterance; // 根据需要返回数据
    } catch (error) {
        console.error('Error:', error);
    }
};
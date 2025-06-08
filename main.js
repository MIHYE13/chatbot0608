// main.js - 이 코드는 이미 잘 작성되어 있습니다.

// VITE 환경 변수 대신, Netlify Function을 호출합니다.
// const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // <-- 이 줄은 더 이상 필요 없습니다. 백엔드에서 관리합니다.

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정 (이 부분을 자유롭게 수정하여 보시면 됩니다)
const systemPrompt = `
당신은 친절하고 유쾌한 수학 교사입니다.
학생의 질문에 쉽고 따뜻하게 답해주세요.
답을 줄 때는 학생의 기분을 한 번씩 물어봐주세요.
예를 들어, 수학 문제를 설명할 땐
직관적이고 구체적인 사례를 들어주세요.
`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
// 이 배열이 Netlify Function으로 전송되어 GPT 모델이 이전 대화를 기억하게 합니다.
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

// UI에 메시지를 추가하는 도우미 함수
// 말풍선 스타일 적용
function addMessageToChatbox(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('mb-2', 'flex', isUser ? 'justify-end' : 'justify-start'); // flexbox 사용하여 정렬

    const contentSpan = document.createElement('span');
    contentSpan.classList.add(
        'px-3',
        'py-1',
        'rounded-lg',
        'inline-block',
        'max-w-xs', // 최대 너비 제한
        'break-words', // 긴 텍스트 줄바꿈
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
    );

    // 발신자 이름은 span 안에 포함시키지 않음 (간결하게 메시지만 표시)
    // 필요하다면 <small class="block text-xs text-gray-500">${sender}</small> 같은 방식으로 추가 가능
    contentSpan.textContent = text; // 텍스트Content 사용하여 안전하게 내용 삽입

    messageDiv.appendChild(contentSpan);
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // 스크롤 하단으로 이동
}


// ✅ 프록시 서버(`vite dev`)는 이 경로를 Netlify Function 에뮬레이터로 자동으로 연결해주지 않기 때문입니다.
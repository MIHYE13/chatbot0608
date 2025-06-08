// const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // 이 줄은 그대로 둡니다. Netlify 환경 변수에서 값을 가져올 것입니다.

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
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

// UI에 메시지를 추가하는 도우미 함수
function addMessageToChatbox(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('mb-2', isUser ? 'text-right' : 'text-left');
    messageDiv.innerHTML = `<span class="${isUser ? 'bg-blue-500 text-white px-3 py-1 rounded-lg inline-block' : 'bg-gray-200 text-gray-800 px-3 py-1 rounded-lg inline-block'}">${sender}: ${text}</span>`;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight; // 스크롤 하단으로 이동
}


async function fetchGPTResponse() {
  // API 키가 없는 경우 에러 발생
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error("OpenAI API key is not set.");
      throw new Error("API key is not configured.");
  }

  try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` // 직접 env 변수 사용
          },
          body: JSON.stringify({
              model: "gpt-4-turbo", //이 부분에서 모델을 바꿔볼 수 있습니다.
              messages: conversationHistory,
              temperature: 0.7, //이 부분은 모델의 창의성을 조절하는 부분입니다. 0정답중심, 1자유로운 창의적인 응답
          }),
      });

      // 응답 상태 코드 확인 (HTTP 2xx가 아니면 에러 처리)
      if (!response.ok) {
          const errorData = await response.json(); // 에러 상세 정보 확인
          console.error("API Error:", response.status, response.statusText, errorData);
          throw new Error(`API request failed with status ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      // 응답 구조 확인 (가끔 API 오류 시 choices 배열이 없을 수 있음)
      if (!data.choices || data.choices.length === 0) {
           console.error("Invalid API response structure:", data);
           throw new Error("Invalid response from API.");
      }

      return data.choices[0].message.content;

  } catch (error) {
      console.error("Error fetching GPT response:", error);
      // 에러를 다시 throw하여 handleSend에서 처리하도록 함
      throw error;
  }
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 입력 UI에 출력
  addMessageToChatbox("나", prompt, true);

  // 사용자 메시지를 대화 이력에 추가
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드, 버튼 비활성화 (응답 대기 중 표시)
  userInput.value = '응답 대기 중...';
  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse();

    // GPT 응답 UI에 출력
    addMessageToChatbox("GPT", reply);

    // GPT 응답도 대화 이력에 추가
    conversationHistory.push({ role: "assistant", content: reply });

  } catch (error) {
    // API 호출 실패 시 에러 메시지 출력
    addMessageToChatbox("GPT (오류)", "죄송합니다. 응답을 가져오는 데 실패했습니다. 문제가 지속되면 관리자에게 문의해주세요.");
    console.error("Failed to get GPT response:", error); // 개발자 도구에 상세 로그 출력
  } finally {
    // 입력 필드, 버튼 다시 활성화 및 초기화
    userInput.value = '';
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus(); // 사용자 입력 필드로 포커스 이동
  }
}

// 버튼 클릭 시 작동
sendBtn.addEventListener('click', handleSend);

// 엔터키 입력 시 작동
userInput.addEventListener('keydown', (e) => {
  // Shift + Enter는 줄바꿈으로 허용
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // 기본 Enter 동작(폼 제출 등) 방지
    handleSend();
  }
});
// Голосовой помощник Felix Academy - Brandbook Version
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

const recordBtn = document.getElementById('recordBtn');
const chatLog = document.getElementById('chatLog');

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// Инициализация
recordBtn.addEventListener('mousedown', startRecording);
recordBtn.addEventListener('mouseup', stopRecording);
recordBtn.addEventListener('touchstart', startRecording);
recordBtn.addEventListener('touchend', stopRecording);

async function startRecording(e) {
    e.preventDefault();
    
    if (isRecording) return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await sendAudioMessage(audioBlob);
            
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordBtn.classList.add('recording');
        
    } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        showError('Не удалось получить доступ к микрофону');
    }
}

function stopRecording(e) {
    e.preventDefault();
    
    if (!isRecording || !mediaRecorder) return;
    
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.classList.remove('recording');
}

async function sendAudioMessage(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.webm');
    
    const userId = tg?.initDataUnsafe?.user?.id || 'demo';
    formData.append('userId', userId);
    
    // Добавляем сообщение пользователя
    addUserMessage('Обработка...');
    
    try {
        const response = await fetch('/api/voice-assistant', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Ошибка сервера');
        
        const data = await response.json();
        
        // Обновляем последнее сообщение пользователя
        updateLastUserMessage(data.transcription || 'Голосовое сообщение');
        
        // Добавляем ответ ассистента
        addAssistantMessage(data.response, data.audioUrl);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showError('Не удалось отправить сообщение');
    }
}

function addUserMessage(text) {
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group-brandbook';
    messageGroup.innerHTML = `
        <div class="message-time-brandbook">${time}</div>
        <div class="message-user-brandbook">
            <div class="waveform-brandbook"></div>
            <p>${text}</p>
        </div>
    `;
    
    chatLog.appendChild(messageGroup);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function updateLastUserMessage(text) {
    const lastMessage = chatLog.querySelector('.message-user-brandbook:last-of-type p');
    if (lastMessage) {
        lastMessage.textContent = text;
    }
}

function addAssistantMessage(text, audioUrl) {
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group-brandbook';
    
    let audioPlayer = '';
    if (audioUrl) {
        audioPlayer = `
            <div class="audio-player-brandbook">
                <button class="play-btn-brandbook" onclick="playAudio('${audioUrl}')">▶</button>
                <span class="audio-time-brandbook">0:00</span>
            </div>
        `;
    }
    
    messageGroup.innerHTML = `
        <div class="message-time-brandbook">${time}</div>
        <div class="message-assistant-brandbook">
            <p>${text}</p>
            ${audioPlayer}
        </div>
    `;
    
    chatLog.appendChild(messageGroup);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function playAudio(url) {
    const audio = new Audio(url);
    audio.play();
}

function showError(message) {
    if (tg?.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

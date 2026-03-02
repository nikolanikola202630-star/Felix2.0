// Voice recording and transcription
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let recordingInterval = null;
let currentNotes = null;

// Toggle recording
async function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        await startRecording();
    }
}

// Start recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            await processAudio(audioBlob);
            
            // Stop all tracks
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        recordingStartTime = Date.now();
        
        // Update UI
        document.getElementById('recordBtnIcon').textContent = '⏹️';
        document.getElementById('recordBtnText').textContent = 'Остановить запись';
        document.getElementById('recordingStatus').textContent = '🔴';
        document.getElementById('recordingTime').style.display = 'block';
        
        // Start timer
        recordingInterval = setInterval(updateRecordingTime, 1000);
        
        tg.HapticFeedback.impactOccurred('medium');
        
    } catch (error) {
        console.error('Start recording error:', error);
        tg.showAlert('Ошибка доступа к микрофону');
    }
}

// Stop recording
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        
        // Update UI
        document.getElementById('recordBtnIcon').textContent = '🎤';
        document.getElementById('recordBtnText').textContent = 'Начать запись';
        document.getElementById('recordingStatus').textContent = '⏺️';
        document.getElementById('recordingTime').style.display = 'none';
        
        // Stop timer
        clearInterval(recordingInterval);
        
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Update recording time
function updateRecordingTime() {
    const elapsed = Date.now() - recordingStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('recordingTime').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Handle audio upload
async function handleAudioUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('uploadStatus').textContent = `Загружен: ${file.name}`;
    
    await processAudio(file);
}

// Process audio (transcribe and generate notes)
async function processAudio(audioBlob) {
    try {
        // Show processing card
        document.getElementById('processingCard').classList.remove('hidden');
        document.getElementById('notesResult').classList.add('hidden');
        
        // Convert to base64
        updateProcessingStatus('Подготовка аудио...', 10);
        const audioBase64 = await blobToBase64(audioBlob);
        
        // Transcribe
        updateProcessingStatus('Распознавание речи...', 30);
        const transcribeResponse = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'transcribe',
                userId: user.id,
                audioData: audioBase64,
                options: {
                    language: getUserLanguage()
                }
            })
        });
        
        const transcribeData = await transcribeResponse.json();
        
        if (!transcribeData.success) {
            throw new Error(transcribeData.error || 'Ошибка распознавания');
        }
        
        // Generate notes
        updateProcessingStatus('Создание конспекта...', 60);
        const notesResponse = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generateNotes',
                userId: user.id,
                transcription: transcribeData.transcription,
                options: {
                    language: getUserLanguage(),
                    style: 'detailed',
                    includeTimestamps: true,
                    includeSummary: true,
                    includeKeyPoints: true,
                    includeQuestions: true
                }
            })
        });
        
        const notesData = await notesResponse.json();
        
        if (!notesData.success) {
            throw new Error(notesData.error || 'Ошибка создания конспекта');
        }
        
        // Show result
        updateProcessingStatus('Готово!', 100);
        setTimeout(() => {
            document.getElementById('processingCard').classList.add('hidden');
            showNotesResult(notesData.notes, notesData.keyInfo);
        }, 500);
        
        tg.HapticFeedback.notificationOccurred('success');
        
    } catch (error) {
        console.error('Process audio error:', error);
        document.getElementById('processingCard').classList.add('hidden');
        tg.showAlert(`Ошибка: ${error.message}`);
        tg.HapticFeedback.notificationOccurred('error');
    }
}

// Update processing status
function updateProcessingStatus(text, progress) {
    document.getElementById('processingStatus').textContent = text;
    document.getElementById('processingProgress').style.width = `${progress}%`;
}

// Show notes result
function showNotesResult(notes, keyInfo) {
    currentNotes = { notes, keyInfo };
    
    document.getElementById('notesResult').classList.remove('hidden');
    document.getElementById('notesContent').textContent = notes;
    
    // Scroll to result
    document.getElementById('notesResult').scrollIntoView({ behavior: 'smooth' });
}

// Save notes
async function saveNotes() {
    if (!currentNotes) return;
    
    try {
        const title = currentNotes.keyInfo?.title || 'Конспект лекции';
        
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'saveNotes',
                userId: user.id,
                title,
                notes: currentNotes.notes,
                metadata: currentNotes.keyInfo,
                tags: currentNotes.keyInfo?.topics || []
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tg.showAlert('✅ Конспект сохранен!');
            tg.HapticFeedback.notificationOccurred('success');
            
            // Reload notes list
            await loadSavedNotes();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Save notes error:', error);
        tg.showAlert(`Ошибка сохранения: ${error.message}`);
    }
}

// Enhance notes
async function enhanceNotes() {
    if (!currentNotes) return;
    
    try {
        updateProcessingStatus('Улучшение конспекта...', 50);
        document.getElementById('processingCard').classList.remove('hidden');
        
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'enhanceNotes',
                userId: user.id,
                notes: currentNotes.notes,
                enhancements: ['addExamples', 'addQuiz']
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentNotes.notes = data.enhancedNotes;
            showNotesResult(data.enhancedNotes, currentNotes.keyInfo);
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            throw new Error(data.error);
        }
        
        document.getElementById('processingCard').classList.add('hidden');
    } catch (error) {
        console.error('Enhance notes error:', error);
        document.getElementById('processingCard').classList.add('hidden');
        tg.showAlert(`Ошибка улучшения: ${error.message}`);
    }
}

// Download notes
function downloadNotes() {
    if (!currentNotes) return;
    
    const blob = new Blob([currentNotes.notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentNotes.keyInfo?.title || 'notes'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    tg.HapticFeedback.impactOccurred('light');
}

// Load saved notes
async function loadSavedNotes() {
    try {
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'listNotes',
                userId: user.id,
                options: { limit: 20 }
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderSavedNotes(data.notes);
            document.getElementById('notesCount').textContent = data.total;
        }
    } catch (error) {
        console.error('Load saved notes error:', error);
    }
}

// Render saved notes
function renderSavedNotes(notes) {
    if (notes.length === 0) {
        document.getElementById('savedNotesList').innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">У тебя пока нет сохраненных конспектов</div>
            </div>
        `;
        return;
    }
    
    const html = notes.map(note => `
        <div class="library-item" onclick="openNote(${note.id})">
            <div class="library-header">
                <div class="library-icon">📝</div>
                <div class="library-title">${note.title}</div>
            </div>
            <div class="library-meta">
                <span>📅 ${new Date(note.created_at).toLocaleDateString('ru-RU')}</span>
                <span>⏱️ ${note.metadata?.estimatedReadTime || '5'} мин</span>
                ${note.tags?.length ? `<span>🏷️ ${note.tags.length}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    document.getElementById('savedNotesList').innerHTML = html;
}

// Open note
async function openNote(noteId) {
    try {
        const response = await fetch('/api/voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'getNotes',
                userId: user.id,
                noteId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentNotes = {
                notes: data.notes.notes,
                keyInfo: data.notes.metadata
            };
            showNotesResult(data.notes.notes, data.notes.metadata);
        }
    } catch (error) {
        console.error('Open note error:', error);
        tg.showAlert('Ошибка загрузки конспекта');
    }
}

// Helper: Convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Helper: Get user language
function getUserLanguage() {
    return localStorage.getItem('language') || 'ru';
}

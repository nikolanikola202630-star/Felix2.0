// Voice API - Transcription and Lecture Notes
const { 
  transcribeAudio, 
  generateLectureNotes,
  generateNotesFromMultipleSegments,
  enhanceNotes,
  extractKeyInfo 
} = require('../../lib/voice/transcription');
const db = require('../../lib/db').db;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, userId, audioData, transcription, notes, options } = req.body;

    switch (action) {
      case 'transcribe':
        return await handleTranscribe(req, res, userId, audioData, options);
      
      case 'generateNotes':
        return await handleGenerateNotes(req, res, userId, transcription, options);
      
      case 'generateFromMultiple':
        return await handleGenerateFromMultiple(req, res, userId, req.body.segments, options);
      
      case 'enhanceNotes':
        return await handleEnhanceNotes(req, res, userId, notes, req.body.enhancements);
      
      case 'extractKeyInfo':
        return await handleExtractKeyInfo(req, res, notes);
      
      case 'saveNotes':
        return await handleSaveNotes(req, res, userId, req.body);
      
      case 'getNotes':
        return await handleGetNotes(req, res, userId, req.body.noteId);
      
      case 'listNotes':
        return await handleListNotes(req, res, userId, options);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Voice API error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
};

// Transcribe audio
async function handleTranscribe(req, res, userId, audioData, options = {}) {
  try {
    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');
    
    // Transcribe
    const result = await transcribeAudio(audioBuffer, options.language || 'ru');
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Save transcription to database
    await db.saveTranscription(userId, {
      text: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments
    });

    return res.json({
      success: true,
      transcription: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments
    });
  } catch (error) {
    console.error('Transcribe error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Generate lecture notes
async function handleGenerateNotes(req, res, userId, transcription, options = {}) {
  try {
    const result = await generateLectureNotes(transcription, options);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Extract key info
    const keyInfo = await extractKeyInfo(result.notes);

    return res.json({
      success: true,
      notes: result.notes,
      metadata: result.metadata,
      keyInfo: keyInfo.success ? keyInfo.info : null
    });
  } catch (error) {
    console.error('Generate notes error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Generate notes from multiple segments
async function handleGenerateFromMultiple(req, res, userId, segments, options = {}) {
  try {
    const result = await generateNotesFromMultipleSegments(segments, options);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json({
      success: true,
      notes: result.notes,
      transcriptions: result.transcriptions,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Generate from multiple error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Enhance notes
async function handleEnhanceNotes(req, res, userId, notes, enhancements = []) {
  try {
    const result = await enhanceNotes(notes, enhancements);
    
    return res.json({
      success: result.success,
      enhancedNotes: result.enhancedNotes || result.originalNotes,
      error: result.error
    });
  } catch (error) {
    console.error('Enhance notes error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Extract key info
async function handleExtractKeyInfo(req, res, notes) {
  try {
    const result = await extractKeyInfo(notes);
    
    return res.json({
      success: result.success,
      info: result.info,
      error: result.error
    });
  } catch (error) {
    console.error('Extract key info error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Save notes
async function handleSaveNotes(req, res, userId, data) {
  try {
    const { title, notes, transcription, metadata, tags } = data;
    
    const noteId = await db.saveNotes(userId, {
      title,
      notes,
      transcription,
      metadata,
      tags: tags || []
    });

    return res.json({
      success: true,
      noteId,
      message: 'Конспект сохранен'
    });
  } catch (error) {
    console.error('Save notes error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get notes
async function handleGetNotes(req, res, userId, noteId) {
  try {
    const notes = await db.getNotes(noteId, userId);
    
    if (!notes) {
      return res.status(404).json({ error: 'Конспект не найден' });
    }

    return res.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// List notes
async function handleListNotes(req, res, userId, options = {}) {
  try {
    const notes = await db.listNotes(userId, {
      limit: options.limit || 20,
      offset: options.offset || 0,
      tags: options.tags,
      search: options.search
    });

    return res.json({
      success: true,
      notes: notes.items,
      total: notes.total,
      hasMore: notes.hasMore
    });
  } catch (error) {
    console.error('List notes error:', error);
    return res.status(500).json({ error: error.message });
  }
}

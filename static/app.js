/* ────────────────────────────────────────────────────────────
   AI Video Transcriber · app.js
   ──────────────────────────────────────────────────────────── */

class VideoTranscriber {
  constructor() {
    this.currentTaskId  = null;
    this.eventSource    = null;
    this.apiBase        = '/api';
    this.currentLang    = 'en';
    this.inputMode      = 'url';   // 'url' | 'file'
    this.selectedFile   = null;
    this.showTimestamps = true;
    this.currentSource          = '';
    this.currentTranslation     = null;
    this.rawTranslation         = null;
    this.showTranslationTimestamps = true;
    this.batchRunning           = false;
    this.batchStopped           = false;

    /* Smart progress simulation */
    this.sp = {
      enabled: false, current: 0, target: 15,
      lastServer: 0, interval: null, startTime: null, stage: 'preparing'
    };

    this.i18n = {
      en: {
        title:                   'AI Video Transcriber',
        subtitle:                'Supports automatic transcription and AI summary for 30+ platforms',
        video_url_placeholder:   'Paste YouTube, Tiktok, Bilibili or other platform video URLs...',
        start_transcription:     'Transcribe',
        ai_settings:             'AI Settings',
        model_base_url:          'Model API Base URL',
        model_base_url_placeholder: 'https://openrouter.ai/api/v1',
        api_key:                 'API Key',
        api_key_placeholder:     'sk-...',
        fetch_models:            'Fetch',
        model_select:            'Model',
        model_default:           '— use server default —',
        summary_language:        'Summary Language',
        processing_progress:     'Processing',
        preparing:               'Preparing…',
        transcript_text:         'Transcript',
        intelligent_summary:     'AI Summary',
        translation:             'Translation',
        download_transcript:     'Transcript',
        download_translation:    'Translation',
        download_summary:        'Summary',
        empty_hint:              'Paste a video URL above and let AI do the heavy lifting.',
        footer_text:             'This tool is part of <a href="https://sipsip.ai" target="_blank" style="color:var(--accent-text);text-decoration:none;">sipsip.ai</a> — transcribe any video, and get daily AI briefs from your favorite creators delivered to your inbox. Free to start.',
        processing:              'Processing…',
        downloading_video:       'Downloading audio…',
        parsing_video:           'Parsing video info…',
        transcribing_audio:      'Transcribing audio…',
        optimizing_transcript:   'Optimizing transcript…',
        generating_summary:      'Generating summary…',
        detecting_subtitles:     'Detecting subtitles…',
        subtitle_found:          'Subtitles found! Processing text…',
        no_subtitle:             'No subtitles found, downloading audio…',
        mode_subtitle:           '⚡ Subtitle',
        mode_whisper:            '🎙 Whisper',
        completed:               'Done!',
        error_invalid_url:       'Please enter a valid video URL',
        error_processing_failed: 'Processing failed: ',
        error_no_download:       'No file available for download',
        error_download_failed:   'Download failed: ',
        fetching_models:         'Fetching models…',
        models_loaded:           (n) => `${n} models loaded`,
        models_error:            'Failed to fetch models',
        timestamp_toggle:        'Timestamps',
        download_srt:            'SRT',
        download_txt:            'TXT',
        save_path_placeholder:   'Save folder path (optional) — e.g. C:\\Users\\Admin\\Transcripts',
        file_saved_to:           'Saved to: ',
        error_save_failed:       'Save failed: ',
        btn_translate:           'Translate',
        translating:             'Translating…',
        translate_empty:         'Select a language and click Translate',
        error_translate_failed:  'Translation failed: ',
        mode_url:                'URL',
        mode_file:               'Local File',
        file_drop_text:          'Drag & drop or click to browse',
        file_drop_hint:          'MP3, MP4, WAV, M4A, MOV and more',
        error_no_file:           'Please select a file to upload',
        error_invalid_file:      'Unsupported file type',
        uploading_file:          'Uploading file…',
        translate_to:            'Translate To',
        translate_to_none:       '— None —',
        auto_translating:        'Auto-translating…',
        mode_batch:              'Batch',
        batch_placeholder:       'Paste video URLs, one per line…',
        batch_start:             'Batch Transcribe',
        batch_stop:              'Stop',
        batch_require_save_path: 'Please set a save folder path for batch mode',
        batch_error_empty:       'Please enter at least one valid URL',
        batch_status_pending:    'Pending',
        batch_status_cancelled:  'Cancelled',
        batch_progress:          (done, total) => `Processing ${done} / ${total}`,
        batch_completed_ok:      (ok, total) => `Done — ${ok}/${total} saved`,
        batch_completed_errors:  (ok, fail, total) => `Done — ${ok} saved, ${fail} failed (${total} total)`,
      },
      zh: {
        title:                   'AI 视频转录器',
        subtitle:                '粘贴 YouTube、TikTok 或任意公开视频链接，获取转录文本和 AI 摘要。',
        video_url_placeholder:   '请输入视频链接…',
        start_transcription:     '开始转录',
        ai_settings:             'AI 设置',
        model_base_url:          'Model API 地址',
        model_base_url_placeholder: 'https://openrouter.ai/api/v1',
        api_key:                 'API Key',
        api_key_placeholder:     'sk-...',
        fetch_models:            '获取',
        model_select:            '模型',
        model_default:           '— 使用服务器默认 —',
        summary_language:        '摘要语言',
        processing_progress:     '处理进度',
        preparing:               '准备中…',
        transcript_text:         '转录文本',
        intelligent_summary:     '智能摘要',
        translation:             '翻译',
        download_transcript:     '转录',
        download_translation:    '翻译',
        download_summary:        '摘要',
        empty_hint:              '在上方粘贴视频链接，让 AI 来处理一切。',
        footer_text:             '本工具是 <a href="https://sipsip.ai" target="_blank" style="color:var(--accent-text);text-decoration:none;">sipsip.ai</a> 的一部分 — 转录任意视频，并将你关注的创作者的每日 AI 简报发送到你的邮箱。免费开始使用。',
        processing:              '处理中…',
        downloading_video:       '正在下载音频…',
        parsing_video:           '正在解析视频信息…',
        transcribing_audio:      '正在转录音频…',
        optimizing_transcript:   '正在优化转录文本…',
        generating_summary:      '正在生成摘要…',
        detecting_subtitles:     '正在检测字幕…',
        subtitle_found:          '字幕获取成功！正在处理文本…',
        no_subtitle:             '未找到字幕，正在下载音频…',
        mode_subtitle:           '⚡ 字幕模式',
        mode_whisper:            '🎙 Whisper 模式',
        completed:               '处理完成！',
        error_invalid_url:       '请输入有效的视频链接',
        error_processing_failed: '处理失败：',
        error_no_download:       '没有可下载的文件',
        error_download_failed:   '下载失败：',
        fetching_models:         '正在获取模型列表…',
        models_loaded:           (n) => `已加载 ${n} 个模型`,
        models_error:            '获取模型失败',
        timestamp_toggle:        '时间戳',
        download_srt:            'SRT',
        download_txt:            'TXT',
        save_path_placeholder:   '保存文件夹路径（可选）— 例如 C:\\Users\\Admin\\Transcripts',
        file_saved_to:           '已保存至：',
        error_save_failed:       '保存失败：',
        btn_translate:           '翻译',
        translating:             '翻译中…',
        translate_empty:         '选择语言后点击翻译',
        error_translate_failed:  '翻译失败：',
        mode_url:                'URL',
        mode_file:               '本地文件',
        file_drop_text:          '拖放或点击选择文件',
        file_drop_hint:          'MP3、MP4、WAV、M4A、MOV 等格式',
        error_no_file:           '请选择要上传的文件',
        error_invalid_file:      '不支持的文件格式',
        uploading_file:          '正在上传文件…',
        translate_to:            '翻译为',
        translate_to_none:       '— 不翻译 —',
        auto_translating:        '正在自动翻译…',
        mode_batch:              '批量',
        batch_placeholder:       '粘贴视频链接，每行一个…',
        batch_start:             '批量转录',
        batch_stop:              '停止',
        batch_require_save_path: '请先设置保存文件夹路径（批量模式必须）',
        batch_error_empty:       '请至少输入一个有效链接',
        batch_status_pending:    '待处理',
        batch_status_cancelled:  '已取消',
        batch_progress:          (done, total) => `处理中 ${done} / ${total}`,
        batch_completed_ok:      (ok, total) => `完成 — ${ok}/${total} 已保存`,
        batch_completed_errors:  (ok, fail, total) => `完成 — ${ok} 成功，${fail} 失败（共 ${total}）`,
      }
    };

    this._initElements();
    this._bindEvents();
    this._loadSettings();
    this._switchLang('en');
  }

  /* ── Elements ─────────────────────────────────────────── */
  _initElements() {
    this.form               = document.getElementById('videoForm');
    this.videoUrlInput      = document.getElementById('videoUrl');
    this.submitBtn          = document.getElementById('submitBtn');
    this.summaryLangSel        = document.getElementById('summaryLanguage');
    this.translationLangSel    = document.getElementById('translationLanguage');
    this.langToggle         = document.getElementById('langToggle');
    this.langText           = document.getElementById('langText');
    this.errorBanner        = document.getElementById('errorBanner');
    this.errorMsg           = document.getElementById('errorMsg');
    this.emptyState         = document.getElementById('emptyState');
    this.progressPanel      = document.getElementById('progressPanel');
    this.modeBadge          = document.getElementById('modeBadge');
    this.progressStatus     = document.getElementById('progressStatus');
    this.progressFill       = document.getElementById('progressFill');
    this.progressMessage    = document.getElementById('progressMessage');
    this.resultsPanel       = document.getElementById('resultsPanel');
    this.scriptContent      = document.getElementById('scriptContent');
    this.summaryContent     = document.getElementById('summaryContent');
    this.translationContent = document.getElementById('translationContent');
    this.dlScript           = document.getElementById('downloadScript');
    this.dlTranslation      = document.getElementById('downloadTranslation');
    this.dlSummary          = document.getElementById('downloadSummary');
    this.translationTabBtn  = document.getElementById('translationTabBtn');
    this.tabBtns            = document.querySelectorAll('.tab-btn');
    this.tabPanes           = document.querySelectorAll('.tab-pane');
    // settings
    this.settingsToggle     = document.getElementById('settingsToggle');
    this.settingsBody       = document.getElementById('settingsBody');
    this.modelBaseUrl       = document.getElementById('modelBaseUrl');
    this.apiKeyInput        = document.getElementById('apiKeyInput');
    this.fetchModelsBtn     = document.getElementById('fetchModelsBtn');
    this.fetchStatus        = document.getElementById('fetchStatus');
    this.modelSelect        = document.getElementById('modelSelect');
    this.fetchIcon          = document.getElementById('fetchIcon');
    this.timestampToggleBtn        = document.getElementById('timestampToggle');
    this.successBanner             = document.getElementById('successBanner');
    this.successMsg                = document.getElementById('successMsg');
    this.savePathInput             = document.getElementById('savePath');
    // translation tab
    this.translateLangSelect       = document.getElementById('translateLangSelect');
    this.translateBtn              = document.getElementById('translateBtn');
    this.translateToolbar          = document.getElementById('translateToolbar');
    this.translateTimestampToggle  = document.getElementById('translateTimestampToggle');
    this.translateEmpty            = document.getElementById('translateEmpty');
    // input mode
    this.tabUrl             = document.getElementById('tabUrl');
    this.tabFile            = document.getElementById('tabFile');
    this.tabBatch           = document.getElementById('tabBatch');
    this.urlPanel           = document.getElementById('urlPanel');
    this.filePanel          = document.getElementById('filePanel');
    this.batchPanel         = document.getElementById('batchPanel');
    this.fileDropZone       = document.getElementById('fileDropZone');
    this.fileInput          = document.getElementById('fileInput');
    this.submitFileBtn      = document.getElementById('submitFileBtn');
    this.batchUrlsInput     = document.getElementById('batchUrls');
    this.submitBatchBtn     = document.getElementById('submitBatchBtn');
    // batch results
    this.batchResultsPanel  = document.getElementById('batchResultsPanel');
    this.batchHeaderText    = document.getElementById('batchHeaderText');
    this.batchList          = document.getElementById('batchList');
    this.batchStopBtn       = document.getElementById('batchStopBtn');
  }

  /* ── Events ───────────────────────────────────────────── */
  _bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.inputMode === 'file')  this._startFileTranscription();
      else if (this.inputMode === 'batch') this._startBatchTranscription();
      else this._startTranscription();
    });

    this.langToggle.addEventListener('click', () => {
      this._switchLang(this.currentLang === 'en' ? 'zh' : 'en');
    });

    // Timestamp toggle (transcript)
    this.timestampToggleBtn.addEventListener('click', () => this._toggleTimestamps());

    // Translation tab
    this.translateBtn.addEventListener('click', () => this._translateContent());
    this.translateTimestampToggle.addEventListener('click', () => this._toggleTranslationTimestamps());

    // Input mode tabs
    this.tabUrl.addEventListener('click',   () => this._switchInputMode('url'));
    this.tabFile.addEventListener('click',  () => this._switchInputMode('file'));
    this.tabBatch.addEventListener('click', () => this._switchInputMode('batch'));

    // Batch stop
    this.batchStopBtn.addEventListener('click', () => {
      this.batchStopped = true;
      this.batchStopBtn.disabled = true;
    });

    // File drop zone: click to open file picker
    this.fileDropZone.addEventListener('click', () => this.fileInput.click());

    // File drag-and-drop
    this.fileDropZone.addEventListener('dragover',  (e) => { e.preventDefault(); this.fileDropZone.classList.add('dragover'); });
    this.fileDropZone.addEventListener('dragleave', ()  => this.fileDropZone.classList.remove('dragover'));
    this.fileDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.fileDropZone.classList.remove('dragover');
      const f = e.dataTransfer.files[0];
      if (f) this._setSelectedFile(f);
    });

    // File input change
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files[0]) this._setSelectedFile(this.fileInput.files[0]);
    });

    // Settings toggle
    this.settingsToggle.addEventListener('click', () => {
      const open = this.settingsBody.classList.toggle('open');
      this.settingsToggle.classList.toggle('open', open);
    });

    // Fetch models
    this.fetchModelsBtn.addEventListener('click', () => this._fetchModels());

    // Auto-fetch when both fields filled (debounced)
    const debouncedFetch = this._debounce(() => {
      if (this.modelBaseUrl.value.trim() && this.apiKeyInput.value.trim()) this._fetchModels();
    }, 900);
    this.modelBaseUrl.addEventListener('input', debouncedFetch);
    this.apiKeyInput.addEventListener('input', debouncedFetch);

    // Persist settings
    [this.modelBaseUrl, this.apiKeyInput, this.modelSelect, this.summaryLangSel, this.translationLangSel, this.savePathInput].forEach(el => {
      el.addEventListener('change', () => this._saveSettings());
    });
    this.savePathInput.addEventListener('input', () => this._saveSettings());

    // Tabs
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this._switchTab(btn.dataset.tab));
    });

    // Downloads
    this.dlScript.addEventListener('click',      () => this._downloadFile('script'));
    this.dlTranslation.addEventListener('click', () => this._downloadFile('translation'));
    this.dlSummary.addEventListener('click',     () => this._downloadFile('summary'));
  }

  /* ── i18n ─────────────────────────────────────────────── */
  t(key) { return this.i18n[this.currentLang][key] || this.i18n['en'][key] || key; }

  _switchLang(lang) {
    this.currentLang = lang;
    this.langText.textContent = lang === 'en' ? 'English' : '中文';
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = this.t('title');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = this.t(el.dataset.i18n);
      if (typeof v === 'string') {
        // footer 等允许含 HTML 的 key 用 innerHTML，其余保持 textContent
        if (el.dataset.i18n === 'footer_text') el.innerHTML = v;
        else el.textContent = v;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const v = this.t(el.dataset.i18nPlaceholder);
      if (typeof v === 'string') el.placeholder = v;
    });
  }

  /* ── Settings persistence ─────────────────────────────── */
  _saveSettings() {
    const s = {
      baseUrl:         this.modelBaseUrl.value,
      apiKey:          this.apiKeyInput.value,
      model:           this.modelSelect.value,
      summaryLang:     this.summaryLangSel.value,
      translateLang:   this.translationLangSel.value,
      savePath:        this.savePathInput.value,
    };
    try { localStorage.setItem('vt_settings', JSON.stringify(s)); } catch (_) {}
  }

  _loadSettings() {
    try {
      const raw = localStorage.getItem('vt_settings');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.baseUrl)       this.modelBaseUrl.value       = s.baseUrl;
      if (s.apiKey)        this.apiKeyInput.value        = s.apiKey;
      if (s.summaryLang)   this.summaryLangSel.value     = s.summaryLang;
      if (s.translateLang !== undefined) this.translationLangSel.value = s.translateLang;
      if (s.savePath)      this.savePathInput.value      = s.savePath;
      // Model options will be restored after fetching
      this._savedModel = s.model || '';

      // Auto-open settings if credentials were saved
      if (s.baseUrl || s.apiKey) {
        this.settingsBody.classList.add('open');
        this.settingsToggle.classList.add('open');
        // Attempt to re-fetch model list silently
        if (s.baseUrl && s.apiKey) {
          setTimeout(() => this._fetchModels(true), 400);
        }
      }
    } catch (_) {}
  }

  /* ── Fetch models ─────────────────────────────────────── */
  async _fetchModels(silent = false) {
    const baseUrl = this.modelBaseUrl.value.trim().replace(/\/$/, '');
    const apiKey  = this.apiKeyInput.value.trim();

    if (!baseUrl || !apiKey) {
      if (!silent) this._setFetchStatus('err', this.t('api_key') + ' & URL required');
      return;
    }

    this.fetchModelsBtn.disabled = true;
    this.fetchIcon.className = 'fas fa-spinner fa-spin';
    if (!silent) this._setFetchStatus('', this.t('fetching_models'));

    try {
      const fd = new FormData();
      fd.append('base_url', baseUrl);
      fd.append('api_key',  apiKey);

      const resp = await fetch(`${this.apiBase}/models`, { method: 'POST', body: fd });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const models = data.data || data.models || [];

      // Rebuild select options
      this.modelSelect.innerHTML = `<option value="">${this.t('model_default')}</option>`;
      models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name || m.id;
        this.modelSelect.appendChild(opt);
      });

      // Restore previously selected model
      if (this._savedModel) {
        this.modelSelect.value = this._savedModel;
        this._savedModel = '';
      }

      this._setFetchStatus('ok', typeof this.t('models_loaded') === 'function'
        ? this.t('models_loaded')(models.length)
        : `${models.length} models`);

    } catch (e) {
      console.warn('Model fetch error:', e);
      this._setFetchStatus('err', this.t('models_error') + ': ' + e.message);
    } finally {
      this.fetchModelsBtn.disabled = false;
      this.fetchIcon.className = 'fas fa-sync-alt';
    }
  }

  _setFetchStatus(cls, msg) {
    this.fetchStatus.className = 'fetch-status' + (cls ? ` ${cls}` : '');
    this.fetchStatus.textContent = msg;
  }

  /* ── Transcription ────────────────────────────────────── */
  async _startTranscription() {
    if (this.submitBtn.disabled) return;

    const url     = this.videoUrlInput.value.trim();
    const sumLang = this.summaryLangSel.value;

    if (!url) { this._showError(this.t('error_invalid_url')); return; }

    this.currentSource = url;
    this._setLoading(true);
    this._hideError();
    this._showProgress();

    try {
      const fd = new FormData();
      fd.append('url',              url);
      fd.append('summary_language', sumLang);
      const transLang = this.translationLangSel.value;
      if (transLang) fd.append('translation_language', transLang);

      const apiKey  = this.apiKeyInput.value.trim();
      const baseUrl = this.modelBaseUrl.value.trim().replace(/\/$/, '');
      const modelId = this.modelSelect.value;
      if (apiKey)  fd.append('api_key',       apiKey);
      if (baseUrl) fd.append('model_base_url', baseUrl);
      if (modelId) fd.append('model_id',       modelId);

      const resp = await fetch(`${this.apiBase}/process-video`, { method: 'POST', body: fd });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Request failed');
      }

      const data = await resp.json();
      this.currentTaskId = data.task_id;

      this._initSP();
      this._updateProgress(5, this.t('preparing'), true);
      this._startSSE();
      this._saveSettings();

    } catch (err) {
      this._showError(this.t('error_processing_failed') + err.message);
      this._setLoading(false);
      this._hideProgress();
    }
  }

  /* ── Input mode ───────────────────────────────────────── */
  _switchInputMode(mode) {
    this.inputMode = mode;
    this.tabUrl.classList.toggle('active',   mode === 'url');
    this.tabFile.classList.toggle('active',  mode === 'file');
    this.tabBatch.classList.toggle('active', mode === 'batch');
    this.urlPanel.style.display   = mode === 'url'   ? '' : 'none';
    this.filePanel.style.display  = mode === 'file'  ? '' : 'none';
    this.batchPanel.style.display = mode === 'batch' ? '' : 'none';
  }

  _setSelectedFile(file) {
    this.selectedFile = file;
    const zone = this.fileDropZone;
    zone.classList.add('selected');
    // Replace inner content to show filename
    zone.innerHTML = `
      <i class="fas fa-check-circle file-drop-icon"></i>
      <p class="file-selected-name">${file.name}</p>
      <p class="file-drop-hint">${(file.size / 1024 / 1024).toFixed(1)} MB — click to change</p>`;
    // Re-attach click handler since innerHTML was replaced
    zone.addEventListener('click', () => this.fileInput.click());
  }

  /* ── File transcription ───────────────────────────────── */
  async _startFileTranscription() {
    if (this.submitFileBtn.disabled) return;

    if (!this.selectedFile) { this._showError(this.t('error_no_file')); return; }

    this.currentSource = this.selectedFile.name;
    this._setLoading(true);
    this._hideError();
    this._showProgress();

    try {
      const fd = new FormData();
      fd.append('file',             this.selectedFile);
      fd.append('summary_language', this.summaryLangSel.value);
      const transLang = this.translationLangSel.value;
      if (transLang) fd.append('translation_language', transLang);

      const apiKey  = this.apiKeyInput.value.trim();
      const baseUrl = this.modelBaseUrl.value.trim().replace(/\/$/, '');
      const modelId = this.modelSelect.value;
      if (apiKey)  fd.append('api_key',       apiKey);
      if (baseUrl) fd.append('model_base_url', baseUrl);
      if (modelId) fd.append('model_id',       modelId);

      this._updateProgress(3, this.t('uploading_file'), true);

      const resp = await fetch(`${this.apiBase}/process-file`, { method: 'POST', body: fd });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await resp.json();
      this.currentTaskId = data.task_id;

      this._initSP();
      this._updateProgress(5, this.t('preparing'), true);
      this._startSSE();
      this._saveSettings();

    } catch (err) {
      this._showError(this.t('error_processing_failed') + err.message);
      this._setLoading(false);
      this._hideProgress();
    }
  }

  /* ── SSE ──────────────────────────────────────────────── */
  _startSSE() {
    if (!this.currentTaskId) return;
    this.eventSource = new EventSource(`${this.apiBase}/task-stream/${this.currentTaskId}`);

    this.eventSource.onmessage = (ev) => {
      try {
        const task = JSON.parse(ev.data);
        if (task.type === 'heartbeat') return;

        this._updateProgress(task.progress, task.message, true);

        if (task.status === 'completed') {
          this._stopSP(); this._stopSSE(); this._setLoading(false); this._hideProgress();
          this._showResults(task.script, task.summary, task.video_title, task.raw_script, task.translation || null, task.raw_translation || null);
        } else if (task.status === 'error') {
          this._stopSP(); this._stopSSE(); this._setLoading(false); this._hideProgress();
          this._showError(task.error || 'Processing error');
        }
      } catch (_) {}
    };

    this.eventSource.onerror = async () => {
      this._stopSSE();
      try {
        if (this.currentTaskId) {
          const r = await fetch(`${this.apiBase}/task-status/${this.currentTaskId}`);
          if (r.ok) {
            const task = await r.json();
            if (task?.status === 'completed') {
              this._stopSP(); this._setLoading(false); this._hideProgress();
              this._showResults(task.script, task.summary, task.video_title, task.raw_script, task.translation || null, task.raw_translation || null);
              return;
            }
          }
        }
      } catch (_) {}
      this._showError(this.t('error_processing_failed') + 'SSE disconnected');
      this._setLoading(false);
    };
  }

  _stopSSE() {
    if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
  }

  /* ── Progress ─────────────────────────────────────────── */
  _updateProgress(pct, msg, fromServer = false) {
    if (fromServer) {
      this._stopSP();
      this.sp.lastServer = pct;
      this.sp.current    = pct;
      this._renderProgress(pct, msg);
      this._updateStage(pct, msg);
      this._startSP();
    } else {
      this._renderProgress(pct, msg);
    }
  }

  _updateStage(pct, msg) {
    const m = (msg || '').toLowerCase();

    // ── 字幕路径（快速）──────────────────────────────────────
    if (m.includes('获取成功') || m.includes('subtitle found') || m.includes('字幕获取')) {
      this.sp.stage = 'subtitle_found';
      this.sp.target = 55;
      this._setModeBadge('subtitle');
    }
    // ── 无字幕 → 音频下载路径（慢）────────────────────────────
    else if (m.includes('未找到字幕') || m.includes('no subtitle') || m.includes('下载视频音频') || m.includes('下载音频')) {
      this.sp.stage = 'downloading';
      this.sp.target = 55;
      this._setModeBadge('whisper');
    }
    // ── 通用字幕检测中 ─────────────────────────────────────────
    else if (m.includes('检测') && (m.includes('字幕') || m.includes('subtitle'))) {
      this.sp.stage = 'subtitle';
      this.sp.target = 40;
    }
    // ── 其他阶段 ───────────────────────────────────────────────
    else if (m.includes('解析') || m.includes('pars'))                     { this.sp.stage = 'parsing';       this.sp.target = 60; }
    else if (m.includes('下载') || m.includes('download'))                 { this.sp.stage = 'downloading';   this.sp.target = 60; }
    else if (m.includes('转录') || m.includes('transcrib') || m.includes('whisper')) { this.sp.stage = 'transcribing';  this.sp.target = 80; }
    else if (m.includes('优化') || m.includes('optimiz'))                  { this.sp.stage = 'optimizing';    this.sp.target = 90; }
    else if (m.includes('翻译') || m.includes('translat'))                 { this.sp.stage = 'translating';   this.sp.target = 85; }
    else if (m.includes('摘要') || m.includes('summary'))                  { this.sp.stage = 'summarizing';   this.sp.target = 95; }
    else if (m.includes('完成') || m.includes('complet'))                  { this.sp.stage = 'completed';     this.sp.target = 100; }

    if (pct >= this.sp.target) this.sp.target = Math.min(pct + 8, 99);
  }

  _setModeBadge(mode) {
    if (!this.modeBadge) return;
    if (mode === 'subtitle') {
      this.modeBadge.textContent  = this.t('mode_subtitle');
      this.modeBadge.className    = 'mode-badge subtitle';
      this.modeBadge.style.display = 'inline-block';
      if (this.progressFill) this.progressFill.classList.add('subtitle-mode');
    } else if (mode === 'whisper') {
      this.modeBadge.textContent  = this.t('mode_whisper');
      this.modeBadge.className    = 'mode-badge whisper';
      this.modeBadge.style.display = 'inline-block';
      if (this.progressFill) this.progressFill.classList.remove('subtitle-mode');
    }
  }

  _initSP() {
    this.sp.enabled = false; this.sp.current = 0; this.sp.target = 15;
    this.sp.lastServer = 0;  this.sp.startTime = Date.now(); this.sp.stage = 'preparing';
  }
  _startSP() {
    if (this.sp.interval) clearInterval(this.sp.interval);
    this.sp.enabled   = true;
    this.sp.startTime = this.sp.startTime || Date.now();
    this.sp.interval  = setInterval(() => this._tickSP(), 500);
  }
  _stopSP() {
    if (this.sp.interval) { clearInterval(this.sp.interval); this.sp.interval = null; }
    this.sp.enabled = false;
  }
  _tickSP() {
    if (!this.sp.enabled || this.sp.current >= this.sp.target) return;
    const speeds = { subtitle: .5, parsing: .3, downloading: .18, transcribing: .14, optimizing: .22, translating: .15, summarizing: .28 };
    let inc = speeds[this.sp.stage] || .2;
    const remaining = this.sp.target - this.sp.current;
    if (remaining < 5) inc *= .3;
    const next = Math.min(this.sp.current + inc, this.sp.target);
    if (next > this.sp.current) {
      this.sp.current = next;
      this._renderProgress(next, this._stageMsg());
    }
  }
  _stageMsg() {
    const map = {
      subtitle:       this.t('detecting_subtitles'),
      subtitle_found: this.t('subtitle_found'),
      downloading:    this.t('downloading_video'),
      parsing:        this.t('parsing_video'),
      transcribing:   this.t('transcribing_audio'),
      optimizing:     this.t('optimizing_transcript'),
      translating:    this.t('auto_translating'),
      summarizing:    this.t('generating_summary'),
      completed:      this.t('completed'),
    };
    return map[this.sp.stage] || this.t('processing');
  }

  _renderProgress(pct, msg) {
    const p = Math.round(pct * 10) / 10;
    this.progressStatus.textContent = `${p}%`;
    this.progressFill.style.width   = `${p}%`;

    // Translate common server messages — more specific checks first
    const m = (msg || '').toLowerCase();
    let label = msg;
    // ── Subtitle path ──────────────────────────────────────────
    if      (m.includes('获取成功') || m.includes('subtitle found'))        label = this.t('subtitle_found');
    else if (m.includes('未找到字幕') || m.includes('no subtitle'))         label = this.t('no_subtitle');
    else if (m.includes('检测') && (m.includes('字幕') || m.includes('subtitle'))) label = this.t('detecting_subtitles');
    // ── Audio / Whisper path ────────────────────────────────────
    else if (m.includes('下载') || m.includes('download'))  label = this.t('downloading_video');
    else if (m.includes('解析') || m.includes('pars'))      label = this.t('parsing_video');
    else if (m.includes('转录') || m.includes('transcrib')) label = this.t('transcribing_audio');
    else if (m.includes('优化') || m.includes('optimiz'))   label = this.t('optimizing_transcript');
    else if (m.includes('翻译') || m.includes('translat'))  label = this.t('auto_translating');
    else if (m.includes('摘要') || m.includes('summary'))   label = this.t('generating_summary');
    else if (m.includes('完成') || m.includes('complet'))   label = this.t('completed');
    else if (m.includes('准备') || m.includes('prepar'))    label = this.t('preparing');

    this.progressMessage.textContent = label;
  }

  _showProgress() {
    this.emptyState.style.display    = 'none';
    this.resultsPanel.classList.remove('show');
    this.progressPanel.classList.add('show');
    // Reset mode badge & progress bar color for new task
    if (this.modeBadge) { this.modeBadge.style.display = 'none'; this.modeBadge.className = 'mode-badge'; }
    if (this.progressFill) this.progressFill.classList.remove('subtitle-mode');
  }
  _hideProgress() { this.progressPanel.classList.remove('show'); }

  /* ── Results ──────────────────────────────────────────── */
  _showResults(script, summary, videoTitle, rawScript, translation = null, rawTranslation = null) {
    // Store both versions: optimized (no timestamps) and raw (with timestamps)
    this.currentScript     = script    || '';
    this.rawScript         = rawScript || null;
    this.currentVideoTitle = videoTitle || 'transcript';
    // Reset toggle to "on" for each new result
    this.showTimestamps = true;

    this.scriptContent.innerHTML  = marked.parse(this._scriptToRender());
    this._updateTimestampBtn();
    this.summaryContent.innerHTML = summary ? marked.parse(summary) : '';

    // Populate translation tab — auto-translation if provided, otherwise reset
    this.showTranslationTimestamps = true;
    if (translation) {
      this.currentTranslation = translation;
      this.rawTranslation     = rawTranslation || null;
      this.translateEmpty.style.display = 'none';
      this.translationContent.style.display = '';
      this.translationContent.innerHTML = marked.parse(this._translationToRender());
      this._updateTranslationTimestampBtn();
    } else {
      this.currentTranslation = null;
      this.rawTranslation     = null;
      this.translationContent.innerHTML = '';
      this.translationContent.style.display = 'none';
      this.translateEmpty.style.display = '';
      this.translateEmpty.textContent = this.t('translate_empty');
      this.translateToolbar.style.display = 'none';
      this.translateTimestampToggle.classList.add('active');
      this.dlTranslation.style.display = 'none';
    }

    this.resultsPanel.classList.add('show');
    this._switchTab('script');
    this.resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  _scriptToRender() {
    // When timestamps ON and raw version exists, show raw (has Whisper timestamps).
    // When OFF or no raw version, show optimized script.
    return (this.showTimestamps && this.rawScript) ? this.rawScript : this.currentScript;
  }

  _updateTimestampBtn() {
    const hasTs = !!this.rawScript;
    this.timestampToggleBtn.style.display = hasTs ? '' : 'none';
    this.timestampToggleBtn.classList.toggle('active', this.showTimestamps);
    this._updateScriptDownloadLabel();
  }

  _updateScriptDownloadLabel() {
    const span = this.dlScript.querySelector('span');
    if (!span) return;
    const isSrt = this.showTimestamps && !!this.rawScript;
    span.textContent = isSrt ? this.t('download_srt') : this.t('download_txt');
  }

  _toggleTimestamps() {
    this.showTimestamps = !this.showTimestamps;
    this.timestampToggleBtn.classList.toggle('active', this.showTimestamps);
    this.scriptContent.innerHTML = marked.parse(this._scriptToRender());
    this._updateScriptDownloadLabel();
  }

  _hideResults() { this.resultsPanel.classList.remove('show'); }

  /* ── On-demand Translation ────────────────────────────── */
  async _translateContent() {
    if (!this.currentScript) { this._showError(this.t('error_no_download')); return; }

    // Show loading state
    this.translateBtn.disabled = true;
    this.translateBtn.innerHTML = `<span class="spinner"></span> ${this.t('translating')}`;
    this.translateEmpty.style.display = '';
    this.translateEmpty.textContent = this.t('translating');
    this.translationContent.style.display = 'none';
    this.dlTranslation.style.display = 'none';

    try {
      const fd = new FormData();
      fd.append('content',         this.currentScript);
      fd.append('target_language', this.translateLangSelect.value);
      if (this.rawScript) fd.append('raw_content', this.rawScript);

      const apiKey  = this.apiKeyInput.value.trim();
      const baseUrl = this.modelBaseUrl.value.trim().replace(/\/$/, '');
      const modelId = this.modelSelect.value;
      if (apiKey)  fd.append('api_key',       apiKey);
      if (baseUrl) fd.append('model_base_url', baseUrl);
      if (modelId) fd.append('model_id',       modelId);

      const r = await fetch(`${this.apiBase}/translate`, { method: 'POST', body: fd });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || 'Translation failed');
      }
      const data = await r.json();

      this.currentTranslation        = data.translation || '';
      this.rawTranslation            = data.raw_translation || null;
      this.showTranslationTimestamps = true;

      this.translateEmpty.style.display = 'none';
      this.translationContent.style.display = '';
      this.translationContent.innerHTML = marked.parse(this._translationToRender());
      this._updateTranslationTimestampBtn();
    } catch (e) {
      this._showError(this.t('error_translate_failed') + e.message);
      this.translateEmpty.style.display = '';
      this.translateEmpty.textContent = this.t('translate_empty');
    } finally {
      this.translateBtn.disabled = false;
      this.translateBtn.innerHTML = `<i class="fas fa-language"></i> <span>${this.t('btn_translate')}</span>`;
    }
  }

  _translationToRender() {
    return (this.showTranslationTimestamps && this.rawTranslation)
      ? this.rawTranslation : this.currentTranslation;
  }

  _updateTranslationTimestampBtn() {
    const hasTs = !!this.rawTranslation;
    this.translateToolbar.style.display = hasTs ? '' : 'none';
    this.translateTimestampToggle.classList.toggle('active', this.showTranslationTimestamps);
    this._updateTranslationDownloadLabel();
    this.dlTranslation.style.display = this.currentTranslation ? 'inline-flex' : 'none';
  }

  _updateTranslationDownloadLabel() {
    const span = this.dlTranslation.querySelector('span');
    if (!span) return;
    const isSrt = this.showTranslationTimestamps && !!this.rawTranslation;
    span.textContent = isSrt ? this.t('download_srt') : this.t('download_txt');
  }

  _toggleTranslationTimestamps() {
    this.showTranslationTimestamps = !this.showTranslationTimestamps;
    this.translateTimestampToggle.classList.toggle('active', this.showTranslationTimestamps);
    this.translationContent.innerHTML = marked.parse(this._translationToRender());
    this._updateTranslationDownloadLabel();
  }

  _downloadTranslation() {
    if (!this.currentTranslation) { this._showError(this.t('error_no_download')); return; }
    const isSrt    = this.showTranslationTimestamps && !!this.rawTranslation;
    const ext      = isSrt ? 'srt' : 'txt';
    const content  = isSrt ? this._toSRT(this.rawTranslation) : this._toPlainText(this.currentTranslation);
    const filename = `translation.${ext}`;
    const basePath = this.savePathInput?.value.trim();

    if (basePath) {
      this._saveToServer(content, basePath, this._videoFolderName(), filename);
    } else {
      this._downloadBlob(content, filename);
    }
  }

  /* ── Tabs ─────────────────────────────────────────────── */
  _switchTab(name) {
    this.tabBtns.forEach(b  => b.classList.toggle('active',  b.dataset.tab === name));
    this.tabPanes.forEach(p => p.classList.toggle('active', p.id === `${name}Tab`));
  }

  /* ── Download helpers ────────────────────────────────── */
  _safeFilename() {
    return (this.currentVideoTitle || 'transcript')
      .replace(/[^\w\-\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) || 'transcript';
  }

  _timeToSrt(t) {
    const parts = t.split(':').map(Number);
    let h = 0, m = 0, s = 0;
    if (parts.length === 3) { [h, m, s] = parts; }
    else                    { [m, s]    = parts; }
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},000`;
  }

  _toSRT(rawScript) {
    const TS_RE = /^\*\*\[(\d{1,2}:\d{2}(?::\d{2})?) - (\d{1,2}:\d{2}(?::\d{2})?)\]\*\*$/;
    const SKIP_RE = /^(#{1,6}\s|source:|$|\*\*Detected|\*\*Language)/;
    const lines    = rawScript.split('\n');
    const segments = [];
    let i = 0;

    while (i < lines.length) {
      const m = lines[i].trim().match(TS_RE);
      if (m) {
        const start = m[1], end = m[2];
        const textLines = [];
        i++;
        while (i < lines.length && !lines[i].trim().match(TS_RE)) {
          const ln = lines[i].trim();
          if (ln && !SKIP_RE.test(ln)) textLines.push(ln);
          i++;
        }
        if (textLines.length) segments.push({ start, end, text: textLines.join('\n') });
      } else {
        i++;
      }
    }

    if (!segments.length) return rawScript; // fallback: no timestamps parsed
    return segments.map((seg, idx) =>
      `${idx + 1}\n${this._timeToSrt(seg.start)} --> ${this._timeToSrt(seg.end)}\n${seg.text}`
    ).join('\n\n') + '\n';
  }

  _toPlainText(markdown) {
    return markdown
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*\n]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^source:.*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  _downloadBlob(content, filename, mime = 'text/plain;charset=utf-8') {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a   = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  _videoFolderName(src = null) {
    src = src ?? this.currentSource ?? '';
    if (!src) return 'unknown';
    try {
      const u = new URL(src);
      // YouTube: use `v` query param
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || 'video';
      }
      // All others: last non-empty path segment (covers TikTok video ID, etc.)
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || 'video';
    } catch {
      // Uploaded file: use name without extension
      return src.replace(/\.[^.]+$/, '').replace(/[^\w\-]/g, '_').slice(0, 60) || 'upload';
    }
  }

  _downloadScript() {
    const isSrt    = this.showTimestamps && !!this.rawScript;
    const ext      = isSrt ? 'srt' : 'txt';
    const content  = isSrt ? this._toSRT(this.rawScript) : this._toPlainText(this.currentScript);
    const filename = `transcript.${ext}`;
    const basePath = this.savePathInput?.value.trim();

    if (basePath) {
      this._saveToServer(content, basePath, this._videoFolderName(), filename);
    } else {
      this._downloadBlob(content, filename);
    }
  }

  async _saveToServerRaw(content, basePath, subfolder, filename) {
    const fd = new FormData();
    fd.append('content',   content);
    fd.append('base_path', basePath);
    fd.append('subfolder', subfolder);
    fd.append('filename',  filename);
    const r = await fetch(`${this.apiBase}/save-file`, { method: 'POST', body: fd });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.detail || 'Save failed');
    }
    return (await r.json()).saved_path;
  }

  async _saveToServer(content, basePath, subfolder, filename) {
    try {
      const savedPath = await this._saveToServerRaw(content, basePath, subfolder, filename);
      this._showSuccess(this.t('file_saved_to') + savedPath);
    } catch (e) {
      this._showError(this.t('error_save_failed') + e.message);
      this._downloadBlob(content, filename);
    }
  }

  /* ── Download ─────────────────────────────────────────── */
  async _downloadFile(type) {
    if (!this.currentTaskId) { this._showError(this.t('error_no_download')); return; }
    try {
      // Client-side generation
      if (type === 'script')      { this._downloadScript();      return; }
      if (type === 'translation') { this._downloadTranslation(); return; }

      const r = await fetch(`${this.apiBase}/task-status/${this.currentTaskId}`);
      if (!r.ok) throw new Error('Failed to get task status');
      const task = await r.json();

      const basename = (p) => p ? p.split(/[\\/]/).pop() : null;
      let filename;
      if (type === 'summary') filename = basename(task.summary_path) || `summary_${task.safe_title||'x'}_${task.short_id||'x'}.md`;
      else throw new Error('Unknown type');

      const a = document.createElement('a');
      a.href = `${this.apiBase}/download/${encodeURIComponent(filename)}`;
      a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) {
      this._showError(this.t('error_download_failed') + e.message);
    }
  }

  /* ── Batch transcription ─────────────────────────────── */
  async _startBatchTranscription() {
    if (this.batchRunning) return;

    const raw = this.batchUrlsInput.value.trim();
    if (!raw) { this._showError(this.t('batch_error_empty')); return; }

    const urls = raw.split('\n')
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://'));

    if (!urls.length) { this._showError(this.t('batch_error_empty')); return; }

    const savePath = this.savePathInput.value.trim();
    if (!savePath) { this._showError(this.t('batch_require_save_path')); return; }

    this.batchRunning = true;
    this.batchStopped = false;
    this.batchStopBtn.disabled = false;
    this.batchStopBtn.style.display = '';

    this._renderBatchList(urls);
    this.batchResultsPanel.style.display = '';
    this.batchResultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this._setLoading(true);
    this._hideError();

    let completed = 0, failed = 0;

    for (let i = 0; i < urls.length; i++) {
      if (this.batchStopped) {
        for (let j = i; j < urls.length; j++) {
          this._updateBatchItem(j, 'cancelled', this.t('batch_status_cancelled'));
        }
        break;
      }
      this._updateBatchHeader(i, urls.length, completed, failed, false);
      const ok = await this._processBatchItem(urls[i], i, savePath);
      if (ok) completed++; else failed++;
    }

    this.batchRunning = false;
    this.batchStopped = false;
    this.batchStopBtn.disabled = true;
    this._setLoading(false);
    this._updateBatchHeader(urls.length, urls.length, completed, failed, true);
  }

  async _processBatchItem(url, index, savePath) {
    this._updateBatchItem(index, 'processing', this.t('preparing'));
    try {
      const fd = new FormData();
      fd.append('url', url);
      fd.append('summary_language', this.summaryLangSel.value);
      const transLang = this.translationLangSel.value;
      if (transLang) fd.append('translation_language', transLang);
      const apiKey  = this.apiKeyInput.value.trim();
      const baseUrl = this.modelBaseUrl.value.trim().replace(/\/$/, '');
      const modelId = this.modelSelect.value;
      if (apiKey)  fd.append('api_key',       apiKey);
      if (baseUrl) fd.append('model_base_url', baseUrl);
      if (modelId) fd.append('model_id',       modelId);

      const resp = await fetch(`${this.apiBase}/process-video`, { method: 'POST', body: fd });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Submit failed');
      }
      const { task_id } = await resp.json();

      const task = await this._waitForBatchTask(task_id, index);
      if (task.status !== 'completed') throw new Error(task.error || 'Processing failed');

      await this._batchAutoSave(task, url, index, savePath);
      return true;
    } catch (e) {
      this._updateBatchItem(index, 'error', e.message);
      return false;
    }
  }

  _waitForBatchTask(taskId, batchIndex) {
    return new Promise((resolve) => {
      let es = null;
      let pollTimer = null;
      let settled = false;

      const settle = (task) => {
        if (settled) return;
        settled = true;
        if (es)        { try { es.close();           } catch(_) {} }
        if (pollTimer) { clearInterval(pollTimer); }
        resolve(task);
      };

      const startPolling = () => {
        const poll = async () => {
          if (settled) return;
          try {
            const r = await fetch(`${this.apiBase}/task-status/${taskId}`);
            if (r.ok) {
              const t = await r.json();
              if (t?.status === 'completed' || t?.status === 'error') {
                settle(t);
              } else if (t?.message) {
                this._updateBatchItem(batchIndex, 'processing', this._translateProgressMsg(t.message), t.progress);
              }
            }
          } catch(_) {}
        };
        pollTimer = setInterval(poll, 2500);
        poll();
      };

      try {
        es = new EventSource(`${this.apiBase}/task-stream/${taskId}`);
        es.onmessage = (ev) => {
          try {
            const task = JSON.parse(ev.data);
            if (task.type === 'heartbeat') return;
            if (task.message) {
              this._updateBatchItem(batchIndex, 'processing', this._translateProgressMsg(task.message), task.progress);
            }
            if (task.status === 'completed' || task.status === 'error') settle(task);
          } catch(_) {}
        };
        es.onerror = () => {
          if (es) { try { es.close(); } catch(_) {} es = null; }
          if (!settled) startPolling();
        };
      } catch(_) {
        startPolling();
      }
    });
  }

  async _batchAutoSave(task, url, batchIndex, savePath) {
    const folder = this._videoFolderName(url);
    const saved  = [];
    const errors = [];

    // Save transcript
    const hasRaw    = !!task.raw_script;
    const tContent  = hasRaw ? this._toSRT(task.raw_script) : this._toPlainText(task.script || '');
    const tFilename = hasRaw ? 'transcript.srt' : 'transcript.txt';
    try {
      await this._saveToServerRaw(tContent, savePath, folder, tFilename);
      saved.push(tFilename);
    } catch(e) { errors.push(`transcript: ${e.message}`); }

    // Save translation if available
    if (task.translation) {
      const hasRawTr = !!task.raw_translation;
      const trContent  = hasRawTr ? this._toSRT(task.raw_translation) : this._toPlainText(task.translation);
      const trFilename = hasRawTr ? 'translation.srt' : 'translation.txt';
      try {
        await this._saveToServerRaw(trContent, savePath, folder, trFilename);
        saved.push(trFilename);
      } catch(e) { errors.push(`translation: ${e.message}`); }
    }

    if (errors.length && !saved.length) {
      this._updateBatchItem(batchIndex, 'error', errors.join('; '));
    } else {
      const msg = `${folder}/ — ${saved.join(', ')}` + (errors.length ? ` (${errors.join('; ')})` : '');
      this._updateBatchItem(batchIndex, 'done', msg);
    }
  }

  _renderBatchList(urls) {
    this.batchList.innerHTML = '';
    urls.forEach((url, i) => {
      const item = document.createElement('div');
      item.className = 'batch-item pending';
      item.id        = `batch-item-${i}`;
      item.innerHTML =
        `<div class="batch-item-icon"><i class="fas fa-clock"></i></div>` +
        `<div class="batch-item-body">` +
          `<div class="batch-item-url">${this._escHtml(url)}</div>` +
          `<div class="batch-item-msg" id="batch-msg-${i}">${this.t('batch_status_pending')}</div>` +
        `</div>`;
      this.batchList.appendChild(item);
    });
    this._updateBatchHeader(0, urls.length, 0, 0, false);
  }

  _updateBatchItem(index, status, msg, progress) {
    const item = document.getElementById(`batch-item-${index}`);
    if (!item) return;
    item.className = `batch-item ${status}`;

    const icons = {
      pending:    '<i class="fas fa-clock"></i>',
      processing: '<i class="fas fa-spinner fa-spin"></i>',
      done:       '<i class="fas fa-check-circle"></i>',
      error:      '<i class="fas fa-times-circle"></i>',
      cancelled:  '<i class="fas fa-ban"></i>',
    };
    const iconEl = item.querySelector('.batch-item-icon');
    const msgEl  = item.querySelector('.batch-item-msg');
    if (iconEl) iconEl.innerHTML = icons[status] || icons.pending;
    if (msgEl)  msgEl.textContent = (progress !== undefined && status === 'processing')
      ? `${msg} (${Math.round(progress)}%)`
      : msg;

    if (status === 'processing') item.scrollIntoView({ block: 'nearest' });
  }

  _updateBatchHeader(done, total, completed, failed, finished) {
    if (!this.batchHeaderText) return;
    if (finished) {
      const fn = failed === 0 ? this.t('batch_completed_ok') : this.t('batch_completed_errors');
      this.batchHeaderText.textContent = typeof fn === 'function'
        ? (failed === 0 ? fn(completed, total) : fn(completed, failed, total))
        : String(fn);
      this.batchStopBtn.style.display = 'none';
    } else {
      const fn = this.t('batch_progress');
      this.batchHeaderText.textContent = typeof fn === 'function' ? fn(done, total) : `${done}/${total}`;
    }
  }

  _translateProgressMsg(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('获取成功') || m.includes('subtitle found'))  return this.t('subtitle_found');
    if (m.includes('未找到字幕') || m.includes('no subtitle'))  return this.t('no_subtitle');
    if (m.includes('检测') && m.includes('字幕'))               return this.t('detecting_subtitles');
    if (m.includes('下载') || m.includes('download'))           return this.t('downloading_video');
    if (m.includes('解析') || m.includes('pars'))               return this.t('parsing_video');
    if (m.includes('转录') || m.includes('transcrib'))          return this.t('transcribing_audio');
    if (m.includes('优化') || m.includes('optimiz'))            return this.t('optimizing_transcript');
    if (m.includes('翻译') || m.includes('translat'))           return this.t('auto_translating');
    if (m.includes('摘要') || m.includes('summary'))            return this.t('generating_summary');
    if (m.includes('完成') || m.includes('done'))               return this.t('completed');
    return msg;
  }

  _escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── UI helpers ───────────────────────────────────────── */
  _setLoading(on) {
    const singleLabel = on
      ? `<span class="spinner"></span> ${this.t('processing')}`
      : `<i class="fas fa-search"></i> <span>${this.t('start_transcription')}</span>`;
    this.submitBtn.disabled      = on;
    this.submitBtn.innerHTML     = singleLabel;
    this.submitFileBtn.disabled  = on;
    this.submitFileBtn.innerHTML = singleLabel;

    const batchLabel = on
      ? `<span class="spinner"></span> ${this.t('processing')}`
      : `<i class="fas fa-layer-group"></i> <span>${this.t('batch_start')}</span>`;
    this.submitBatchBtn.disabled  = on;
    this.submitBatchBtn.innerHTML = batchLabel;
  }

  _showError(msg) {
    this.errorMsg.textContent = msg;
    this.errorBanner.classList.add('show');
    this.errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => this._hideError(), 6000);
  }
  _hideError() { this.errorBanner.classList.remove('show'); }

  _showSuccess(msg) {
    this.successMsg.textContent = msg;
    this.successBanner.classList.add('show');
    this.successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => this._hideSuccess(), 5000);
  }
  _hideSuccess() { this.successBanner.classList.remove('show'); }

  _debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }
}

/* ── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  window.vt = new VideoTranscriber();
});

window.addEventListener('beforeunload', () => {
  if (window.vt?.eventSource) window.vt._stopSSE();
});

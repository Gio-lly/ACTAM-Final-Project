// ######################################## GESTIONE DELLA REGISTRAZIONE AUDIO (MAX. 1 MINUTE)
let wsurf, wave
// Utilizziamo il Plugin Record di Wavesurfer
let record = WaveSurfer.Record.create({
  renderRecordedAudio: true, // visualizza l'onda durante la registrazione
  continuousWaveform: true,  // Abilita la visualizzazione continua
  continuousWaveformDuration: 60, // Durata opzionale della visualizzazione continua
  bufferSize: 2048, // Dimensione del buffer (implica la qualità del waveform)
});

// Quando il record-button viene cliccato, si visualizza la finestra di registrazione
document.getElementById("record-btn").addEventListener("click", function (event) {
  event.stopPropagation(); //opzionale qui
  document.getElementById("recording-section").style.display = "block"; // Mostra la sezione di registrazione
  document.getElementById("record-btn").style.display = "none"; // Nasconde il bottone "Registra"
  createWaveSurfer(); // Creaimo la session
});

const createWaveSurfer = () => {
  // Creiamo una nuova istanza di wavesurfer
  wsurf = WaveSurfer.create({
    container: '#mic', // link all' html
    waveColor: '#dd5e98',
    progressColor: '#ff4e00',
    plugins: [record] // aggiungiamo il plugin Record
  })

  //-------------------------------------------------------------------------------- GESTIONE INIZIO REC: 
  record.on('record-start', () => {
    // sovrascriviamo la rec precedente se c'era...
    if (wave) {
      wave.destroy()
    }

    // Rimozione del pulsante di play e del link di download dalla sezione precedente
    const container = document.querySelector('#recordings');
    container.innerHTML = '';
  })  

  //-------------------------------------------------------------------------------- GESTIONE FINE REC: 
  // salvataggio della registrazione
  record.on('record-end', (blob) => {
    const container = document.querySelector('#recordings')
    const recordedUrl = URL.createObjectURL(blob)
    
    // Comportamento del Play/Pause button(s)
    const button = container.appendChild(document.createElement('button'))
    button.textContent = 'Play'
    button.onclick = () => wsurf.playPause()
    wsurf.on('pause', () => (button.textContent = 'Play'))
    wsurf.on('play', () => (button.textContent = 'Pause'))

    // rendiamo disponibile un Download link
    const link = container.appendChild(document.createElement('a'))
    Object.assign(link, {
      href: recordedUrl,
      download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
      textContent: 'Download recording',
    })

    // Aggiungi il file Webm alla lista di selectedFiles in script.js
    const blobFile = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });

    // Emissione dell'evento personalizzato per passare il file Webm, così che possiamo processarlo
    const event = new CustomEvent('recording-completed', { detail: { file: blobFile } });
    window.dispatchEvent(event);
  });

  pauseButton.style.display = 'none'
  recButton.textContent = 'Record'

  record.on('record-progress', (time) => {
    // TIMER OROLOGIO DURANTE REGISTRAZIONE
    updateProgress(time)
  })
}

//-------------------------------------------------------------------------------- GESTIONE TIMER OROLOGIO (IN SECONDI)
const progress = document.querySelector('#progress')
const updateProgress = (time) => {
  // time will be in milliseconds, convert it to mm:ss format
  const formattedTime = [
    Math.floor((time % 3600000) / 60000), // minutes
    Math.floor((time % 60000) / 1000), // seconds
  ]
    .map((v) => (v < 10 ? '0' + v : v))
    .join(':')
  progress.textContent = formattedTime

  // !!SE LA REGISTRAZIONE SUPERA 60sec LA FERMO E SONO PRONTO A PROCESSARE IL FILE!!
  if (time >= 60000) {
    record.stopRecording(); // Ferma la registrazione
    recButton.textContent = 'Record'; // Ripristina il bottone di registrazione
    pauseButton.style.display = 'none'; // Nasconde il bottone di pausa
  }
}

//-------------------------------------------------------------------------------- GESTIONE BOTTONE PAUSE
const pauseButton = document.querySelector('#pause')
pauseButton.onclick = (event) => {
  event.stopPropagation();
  if (record.isPaused()) {
    record.resumeRecording()
    pauseButton.textContent = 'Pause'
    return
  }

  record.pauseRecording()
  pauseButton.textContent = 'Resume'
}

//-------------------------------------------------------------------------------- GESTIONE MIC SELECTION
const micSelect = document.querySelector('#mic-select')

micSelect.addEventListener('click', function(event) {
  event.stopPropagation(); // Impedisce la propagazione dell'evento
});

// Mic selection
WaveSurfer.Record.getAvailableAudioDevices().then((devices) => {
  devices.forEach((device) => {
  const option = document.createElement('option')
  option.value = device.deviceId
  option.text = device.label || device.deviceId
  micSelect.appendChild(option)
  })
})

//-------------------------------------------------------------------------------- GESTIONE RECORD BUTTON
const recButton = document.querySelector('#record')

recButton.onclick = (event) => {
  if (record.isRecording() || record.isPaused()) {
    record.stopRecording()
    recButton.textContent = 'Record'
    pauseButton.style.display = 'none'
    return
  }

  recButton.disabled = true

  // reset the wavesurfer instance

  // get selected device
  const deviceId = micSelect.value
  record.startRecording({ deviceId }).then(() => {
    recButton.textContent = 'Stop'
    recButton.disabled = false
    pauseButton.style.display = 'inline'
  })
}
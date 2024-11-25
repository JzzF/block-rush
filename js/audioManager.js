class AudioManager {
    constructor() {
        this.bgm = document.getElementById('bgm');
        this.placeSound = document.getElementById('place-sound');
        this.clearSound = document.getElementById('clear-sound');
        this.comboSound = document.getElementById('combo-sound');
        this.phaseChangeSound = document.getElementById('phase-change');

        // Initialize audio settings
        this.bgm.volume = CONFIG.SOUND.BGM.VOLUME;
        this.placeSound.volume = CONFIG.SOUND.SFX.PLACE.VOLUME;
        this.clearSound.volume = CONFIG.SOUND.SFX.CLEAR.VOLUME;
        this.comboSound.volume = CONFIG.SOUND.SFX.COMBO.VOLUME;
        this.phaseChangeSound.volume = CONFIG.SOUND.SFX.PHASE_CHANGE.VOLUME;

        // Bind methods
        this.startBGM = this.startBGM.bind(this);
        this.stopBGM = this.stopBGM.bind(this);
        this.playPlaceSound = this.playPlaceSound.bind(this);
        this.playClearSound = this.playClearSound.bind(this);
        this.playComboSound = this.playComboSound.bind(this);
        this.playPhaseChangeSound = this.playPhaseChangeSound.bind(this);
    }

    startBGM() {
        this.bgm.currentTime = 0;
        this.bgm.play().catch(error => console.log('BGM autoplay prevented:', error));
        
        // Fade in
        let volume = 0;
        const targetVolume = CONFIG.SOUND.BGM.VOLUME;
        const fadeInterval = setInterval(() => {
            volume = Math.min(volume + 0.1, targetVolume);
            this.bgm.volume = volume;
            if (volume >= targetVolume) {
                clearInterval(fadeInterval);
            }
        }, CONFIG.SOUND.BGM.FADE_DURATION / 10);
    }

    stopBGM() {
        // Fade out
        const startVolume = this.bgm.volume;
        let volume = startVolume;
        const fadeInterval = setInterval(() => {
            volume = Math.max(volume - 0.1, 0);
            this.bgm.volume = volume;
            if (volume <= 0) {
                clearInterval(fadeInterval);
                this.bgm.pause();
            }
        }, CONFIG.SOUND.BGM.FADE_DURATION / 10);
    }

    playPlaceSound() {
        // Random variation
        const variation = Math.floor(Math.random() * CONFIG.SOUND.SFX.PLACE.VARIATIONS) + 1;
        this.placeSound.src = `audio/place${variation}.mp3`;
        this.placeSound.currentTime = 0;
        this.placeSound.play().catch(error => console.log('Place sound error:', error));
    }

    playClearSound() {
        const variation = Math.floor(Math.random() * CONFIG.SOUND.SFX.CLEAR.VARIATIONS) + 1;
        this.clearSound.src = `audio/clear${variation}.mp3`;
        this.clearSound.currentTime = 0;
        this.clearSound.play().catch(error => console.log('Clear sound error:', error));
    }

    playComboSound() {
        const variation = Math.floor(Math.random() * CONFIG.SOUND.SFX.COMBO.VARIATIONS) + 1;
        this.comboSound.src = `audio/combo${variation}.mp3`;
        this.comboSound.currentTime = 0;
        this.comboSound.play().catch(error => console.log('Combo sound error:', error));
    }

    playPhaseChangeSound() {
        this.phaseChangeSound.currentTime = 0;
        this.phaseChangeSound.play().catch(error => console.log('Phase change sound error:', error));
    }

    // Update BGM speed based on game phase
    updateBGMSpeed(phase) {
        this.bgm.playbackRate = CONFIG.GAME.PHASES[phase].SPEED;
    }
}

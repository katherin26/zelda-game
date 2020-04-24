'use strict';

export default class Screen {
    #screen;
    #audioReady;
    #MENUTYPES = ['MAIN', 'PAUSE', 'GAMEOVER', 'KO'];

    // Menu visuals
    #mainMenu;
    #pauseMenu;
    #gameOverMenu;
    #koMenu;

    // Menu audios
    #mainMenuAudio;
    #gameOverMenuAudio;
    #koMenuAudio;
    #battleAudio;

    // Buttons
    #startGameButtons;
    #goToMainMenuButtons;

    // Game instance
    #game;

    // Health stats
    #statusBar;
    #linkHealth;
    #enemyHealth;

    #currentMenu;

    constructor(game) {
        this.#game = game;
        this.#screen = document.getElementById('gameScreen');
        this.#mainMenu = this.#screen.querySelector('#mainMenu');
        this.#pauseMenu = this.#screen.querySelector('#pauseMenu');
        this.#gameOverMenu = this.#screen.querySelector('#gameOverMenu');
        this.#koMenu = this.#screen.querySelector('#koMenu');
        this.#statusBar = document.getElementById('gameStatus');
        this.#linkHealth = this.#statusBar.querySelectorAll('#linkHealth .heart');
        this.#enemyHealth = this.#statusBar.querySelectorAll('#enemyHealth .heart');
        this.registerEvents();
        this.configureAudio();
    }

    set menu(menu) {
        if (menu && !this.#MENUTYPES.includes(menu))
            throw new Error('Invalid menu type');

        if (!this.#screen.classList.contains('hidden'))
            this.#screen.classList.add('hidden');

        if (!this.#mainMenu.classList.contains('hidden'))
            this.#mainMenu.classList.add('hidden');

        if (!this.#pauseMenu.classList.contains('hidden'))
            this.#pauseMenu.classList.add('hidden');

        if (!this.#koMenu.classList.contains('hidden'))
            this.#koMenu.classList.add('hidden');

        if (!this.#gameOverMenu.classList.contains('hidden'))
            this.#gameOverMenu.classList.add('hidden');

        if (this.#audioReady) {
            try {
                if (menu === 'PAUSE' && !this.#currentMenu) this.#battleAudio.pause();
                else if (!menu && this.#currentMenu === 'PAUSE') this.#battleAudio.play();
                else {
                    this.#mainMenuAudio.pause();
                    this.#gameOverMenuAudio.pause();
                    this.#koMenuAudio.pause();
                    this.#battleAudio.pause();

                    this.#mainMenuAudio.currentTime = 0;
                    this.#gameOverMenuAudio.currentTime = 0;
                    this.#koMenuAudio.currentTime = 0;
                    this.#battleAudio.currentTime = 0;

                    switch (menu) {
                        case 'MAIN': this.#mainMenuAudio.play();
                            break;
                        case 'GAMEOVER': this.#gameOverMenuAudio.play();
                            break;
                        case 'KO': this.#koMenuAudio.play();
                            break;
                        default: this.#battleAudio.play();
                    }
                }
            } catch (e) {
                console.error(`Unable to play audio ${e}`);
            }
        }

        switch (menu) {
            case 'MAIN':
                this.#mainMenu.classList.remove('hidden');
                break;
            case 'PAUSE':
                this.#pauseMenu.classList.remove('hidden');
                break;
            case 'GAMEOVER':
                this.#gameOverMenu.classList.remove('hidden');
                break;
            case 'KO':
                this.#koMenu.classList.remove('hidden');
                break;
        }

        if (menu)
            this.#screen.classList.remove('hidden');

        this.#currentMenu = menu;
    }

    resetHealthBars() {
        for (const [index, heart] of this.#linkHealth.entries()) {
            heart.classList.remove('heart_0', 'heart_50');
            heart.classList.add('heart_100');
        }

        for (const [index, heart] of this.#enemyHealth.entries()) {
            heart.classList.remove('heart_0', 'heart_50');
            heart.classList.add('heart_100');
        }
    }

    registerEvents() {
        this.#startGameButtons = this.#screen.querySelectorAll('.startGame');
        this.#goToMainMenuButtons = this.#screen.querySelectorAll('.goToMainMenu');

        for (let button of this.#startGameButtons) {
            button.addEventListener('click', (e) => {
                this.#audioReady = true;
                const linkHealth = this.#screen.querySelector('#linkHealth');
                const linkStrength = this.#screen.querySelector('#linkStrength');
                const enemyHealth = this.#screen.querySelector('#enemyHealth');
                const enemyStrength = this.#screen.querySelector('#enemyStrength');
                this.#game.startNewGame(linkHealth.value, linkStrength.value, enemyHealth.value, enemyStrength.value);
                this.resetHealthBars();
                this.#statusBar.classList.remove('hidden');
            });
        }

        for (let button of this.#goToMainMenuButtons) {
            button.addEventListener('click', (e) => {
                this.#statusBar.classList.add('hidden');
                if (!this.#koMenu.classList.contains('hidden')) this.#koMenu.classList.add('hidden');
                if (!this.#gameOverMenu.classList.contains('hidden')) this.#gameOverMenu.classList.add('hidden');
                this.#mainMenu.classList.remove('hidden');
                this.menu = 'MAIN';
            });
        }
    }

    updateHealthBar(character, totalHealth, currentHealth) {
        const healthPorcentage = (currentHealth * 100) / totalHealth;

        if (character === 'Warrior') {
            for (const [index, heart] of this.#linkHealth.entries()) {
                let limitFull = (index + 1) * 20;
                let limitHalf = limitFull - 10;
                let limitEmpty = limitFull - 20;

                if (healthPorcentage <= limitEmpty) {
                    heart.classList.remove('heart_100', 'heart_50');
                    heart.classList.add('heart_0');
                    continue;
                }

                if (healthPorcentage <= limitHalf) {
                    heart.classList.remove('heart_100');
                    heart.classList.add('heart_50');
                }
            }
        }

        if (character === 'Monster') {
            for (const [index, heart] of this.#enemyHealth.entries()) {
                let limitFull = (index + 1) * 20;
                let limitHalf = limitFull - 10;
                let limitEmpty = limitFull - 20;

                if (healthPorcentage <= limitEmpty) {
                    heart.classList.remove('heart_100', 'heart_50');
                    heart.classList.add('heart_0');
                    continue;
                }

                if (healthPorcentage <= limitHalf) {
                    heart.classList.remove('heart_100');
                    heart.classList.add('heart_50');
                }
            }
        }
    }

    configureAudio() {
        try {
            this.#mainMenuAudio = new Audio('./assets/audio/mm.mp3');
            this.#mainMenuAudio.loop = true;
            this.#gameOverMenuAudio = new Audio('./assets/audio/lost.mp3');
            this.#koMenuAudio = new Audio('./assets/audio/victory.mp3');
            this.#battleAudio = new Audio('./assets/audio/battle.mp3');
            this.#battleAudio.loop = true;
        } catch (e) {
            console.error(`Unable to configure audio ${e}`);
        }
    }
}
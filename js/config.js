const CONFIG = {
    GAME: {
        GRID_SIZE: 8,
        ROUND_TIME: 90, // seconds
        PHASES: {
            1: {
                START_TIME: 90,
                END_TIME: 61,
                SPEED: 1,
                MULTIPLIER: 1.0,
                COLOR: '#FFFFFF'
            },
            2: {
                START_TIME: 60,
                END_TIME: 31,
                SPEED: 1.5,
                MULTIPLIER: 1.5,
                COLOR: '#FFD700'
            },
            3: {
                START_TIME: 30,
                END_TIME: 0,
                SPEED: 2,
                MULTIPLIER: 2.0,
                COLOR: '#FF4444'
            }
        }
    },

    SCORING: {
        BASE_POINTS: 100,
        COMBO_MULTIPLIER: 1.5,
        LINES: {
            1: 100,
            2: 300,
            3: 600,
            4: 1000
        }
    },

    COLORS: {
        GRID: 'rgba(255, 255, 255, 0.2)',
        BLOCKS: {
            1: '#4CAF50', // Green
            2: '#2196F3', // Blue
            3: '#FF9800', // Orange
        },
        PREVIEW: 'rgba(255, 255, 255, 0.3)',
        CLEARED: '#FFFFFF'
    },

    ANIMATIONS: {
        PLACE_BLOCK: {
            DURATION: 300,
            EASING: 'ease-out'
        },
        CLEAR_LINE: {
            DURATION: 500,
            EASING: 'ease-out'
        },
        PHASE_CHANGE: {
            DURATION: 1000,
            EASING: 'ease-in-out'
        },
        COMBO: {
            DURATION: 1000,
            EASING: 'ease-out'
        }
    },

    BLOCKS: {
        NUM_CHOICES: 3,
        TYPES: [
            // 1x1 block
            [[1]],
            // 2x2 block
            [
                [1, 1],
                [1, 1]
            ],
            // 3x3 block
            [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ]
        ]
    },

    SOUND: {
        BGM: {
            VOLUME: 0.3,
            FADE_DURATION: 1000
        },
        SFX: {
            PLACE: {
                VOLUME: 0.5,
                VARIATIONS: 3
            },
            CLEAR: {
                VOLUME: 0.6,
                VARIATIONS: 2
            },
            COMBO: {
                VOLUME: 0.7,
                VARIATIONS: 3
            },
            PHASE_CHANGE: {
                VOLUME: 0.8
            }
        }
    }
};

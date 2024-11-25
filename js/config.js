const CONFIG = {
    GAME: {
        GRID_SIZE: 10, // Updated to 10x10 grid
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
            4: '#E91E63', // Pink
            5: '#9C27B0'  // Purple
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
            // Square (2x2)
            {
                pattern: [
                    [1, 1],
                    [1, 1]
                ],
                weight: 100 // Higher weight = more frequent
            },
            // Line (1x4)
            {
                pattern: [[1, 1, 1, 1]],
                weight: 80
            },
            // Line (1x5)
            {
                pattern: [[1, 1, 1, 1, 1]],
                weight: 60
            },
            // Small L (2x3)
            {
                pattern: [
                    [1, 0],
                    [1, 0],
                    [1, 1]
                ],
                weight: 70
            },
            // Large L (3x3)
            {
                pattern: [
                    [1, 0, 0],
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                weight: 50
            },
            // T-Shape (3x2)
            {
                pattern: [
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                weight: 70
            },
            // Small Z (3x2)
            {
                pattern: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                weight: 60
            },
            // Small Corner (2x2)
            {
                pattern: [
                    [1, 1],
                    [1, 0]
                ],
                weight: 90
            },
            // Large Corner (3x3)
            {
                pattern: [
                    [1, 1, 1],
                    [1, 0, 0],
                    [1, 0, 0]
                ],
                weight: 50
            },
            // Plus Shape (3x3)
            {
                pattern: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ],
                weight: 40
            },
            // W Shape (3x2)
            {
                pattern: [
                    [1, 0, 1],
                    [1, 1, 1]
                ],
                weight: 50
            }
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

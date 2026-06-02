// Cooperative Equations Game Config
// Role definitions: 0=Player A, 1=Player B, 2=Player C, 3=Player D, 4=Player E, 5=Player F

export const EQUATIONS_MATRIX = {
    0: [
        "A = 9 - 6 + 2",
        "B = C - A + 2",
        "C = A + B - 2",
        "D = F - E - 1",
        "E = F - D - 1",
        "F = E + D + 1"
    ],
    1: [
        "A = C - B + 2",
        "B = 8 - 7 + 2",
        "C = A + B - 2",
        "D = F - E - 1",
        "E = F - D - 1",
        "F = E + D + 1"
    ],
    2: [
        "A = C - B + 2",
        "B = C - A + 2",
        "C = 5 + 3 - 2",
        "D = F - E - 1",
        "E = F - D - 1",
        "F = E + D + 1"
    ],
    3: [
        "A = C - B + 2",
        "B = C - A + 2",
        "C = A + B - 2",
        "D = 9 - 6 - 1",
        "E = F - D - 1",
        "F = E + D + 1"
    ],
    4: [
        "A = C - B + 2",
        "B = C - A + 2",
        "C = A + B - 2",
        "D = F - E - 1",
        "E = 8 - 3 - 1",
        "F = E + D + 1"
    ],
    5: [
        "A = C - B + 2",
        "B = C - A + 2",
        "C = A + B - 2",
        "D = F - E - 1",
        "E = F - D - 1",
        "F = 4 + 2 + 1"
    ]
};

export const ROLE_LABELS = {
    0: { name: "Player A", variable: "A", targetValue: 5 },
    1: { name: "Player B", variable: "B", targetValue: 3 },
    2: { name: "Player C", variable: "C", targetValue: 6 },
    3: { name: "Player D", variable: "D", targetValue: 2 },
    4: { name: "Player E", variable: "E", targetValue: 4 },
    5: { name: "Player F", variable: "F", targetValue: 7 }
};

export const EQUATIONS_PASSCODE = 27;

// Equations Warm-up configuration (Standard system of 2 linear equations, 2 variables)
export const WARMUP_EQUATIONS = [
    "A + A - B = 10",
    "B + B - A = 1"
];
export const WARMUP_PASSCODE = 11;


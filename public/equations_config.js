// Cooperative Equations Game Config
// Role definitions: 0=Player A, 1=Player B, 2=Player C, 3=Player D, 4=Player E, 5=Player F

export const EQUATIONS_MATRIX = {
    0: [
        "A = 8 - 3",
        "B = 9 - C",
        "C = D + E",
        "D = C - E",
        "E = A - D + 1",
        "F = B + E"
    ],
    1: [
        "A = F - 2",
        "B = 7 - 4",
        "C = D + E",
        "D = C - E",
        "E = A - D + 1",
        "F = B + E"
    ],
    2: [
        "A = F - 2",
        "B = 9 - C",
        "C = 2 * 3",
        "D = C - E",
        "E = A - D + 1",
        "F = B + E"
    ],
    3: [
        "A = F - 2",
        "B = 9 - C",
        "C = D + E",
        "D = 10 / 5",
        "E = A - D + 1",
        "F = B + E"
    ],
    4: [
        "A = F - 2",
        "B = 9 - C",
        "C = D + E",
        "D = C - E",
        "E = 9 - 5",
        "F = B + E"
    ],
    5: [
        "A = F - 2",
        "B = 9 - C",
        "C = D + E",
        "D = C - E",
        "E = A - D + 1",
        "F = 4 + 3"
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


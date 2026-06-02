// Cooperative Equations Game Config
// Role definitions: 0=Player A, 1=Player B, 2=Player C, 3=Player D, 4=Player E, 5=Player F

export const EQUATIONS_MATRIX = {
    0: [
        "A = 8 - 4 + 1",
        "B = D - C + 7",
        "C = E - D + 4",
        "D = F - E - 1",
        "E = A - F + 6",
        "F = B - A + 9"
    ],
    1: [
        "A = C - B + 2",
        "B = 9 - 8 + 2",
        "C = E - D + 4",
        "D = F - E - 1",
        "E = A - F + 6",
        "F = B - A + 9"
    ],
    2: [
        "A = C - B + 2",
        "B = D - C + 7",
        "C = 7 - 4 + 3",
        "D = F - E - 1",
        "E = A - F + 6",
        "F = B - A + 9"
    ],
    3: [
        "A = C - B + 2",
        "B = D - C + 7",
        "C = E - D + 4",
        "D = 8 - 4 - 2",
        "E = A - F + 6",
        "F = B - A + 9"
    ],
    4: [
        "A = C - B + 2",
        "B = D - C + 7",
        "C = E - D + 4",
        "D = F - E - 1",
        "E = 9 - 7 + 2",
        "F = B - A + 9"
    ],
    5: [
        "A = C - B + 2",
        "B = D - C + 7",
        "C = E - D + 4",
        "D = F - E - 1",
        "E = A - F + 6",
        "F = 8 - 5 + 4"
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


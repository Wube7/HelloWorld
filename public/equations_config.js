// Cooperative Equations Game Config
// Role definitions: 0=Player A, 1=Player B, 2=Player C, 3=Player D, 4=Player E, 5=Player F

export const EQUATIONS_MATRIX = {
    0: [
        "A = 5 + 3 - 2",
        "B = D + E + 5 - C",
        "C = E + F - 2 - D",
        "D = F + A - 6 - E",
        "E = A + B + 2 - F",
        "F = B + C + 1 - A"
    ],
    1: [
        "A = C + D - B",
        "B = 3 + 2 + 5 - 6",
        "C = E + F - 2 - D",
        "D = F + A - 6 - E",
        "E = A + B + 2 - F",
        "F = B + C + 1 - A"
    ],
    2: [
        "A = C + D - B",
        "B = D + E + 5 - C",
        "C = 6 + 9 - 2 - 5",
        "D = F + A - 6 - E",
        "E = A + B + 2 - F",
        "F = B + C + 1 - A"
    ],
    3: [
        "A = C + D - B",
        "B = D + E + 5 - C",
        "C = E + F - 2 - D",
        "D = 3 + 9 - 6 - 4",
        "E = A + B + 2 - F",
        "F = B + C + 1 - A"
    ],
    4: [
        "A = C + D - B",
        "B = D + E + 5 - C",
        "C = E + F - 2 - D",
        "D = F + A - 6 - E",
        "E = 7 + 2 + 2 - 6",
        "F = B + C + 1 - A"
    ],
    5: [
        "A = C + D - B",
        "B = D + E + 5 - C",
        "C = E + F - 2 - D",
        "D = F + A - 6 - E",
        "E = A + B + 2 - F",
        "F = 5 + 4 + 1 - 3"
    ]
};

export const ROLE_LABELS = {
    0: { name: "Player A", variable: "A", targetValue: 6 },
    1: { name: "Player B", variable: "B", targetValue: 4 },
    2: { name: "Player C", variable: "C", targetValue: 8 },
    3: { name: "Player D", variable: "D", targetValue: 2 },
    4: { name: "Player E", variable: "E", targetValue: 5 },
    5: { name: "Player F", variable: "F", targetValue: 7 }
};

export const EQUATIONS_PASSCODE = 32;

// Equations Warm-up configuration (Standard system of 2 linear equations, 2 variables)
export const WARMUP_EQUATIONS = [
    "A + A - B = 10",
    "B + B - A = 1"
];
export const WARMUP_PASSCODE = 11;


const fs = require('fs')

const STATE = {
    START: "start",
    NUM: "num",
    CHAR: "char",
}
const TOKENTYPE = {
    PROGRAM: "PROGRAM",
    TYPE: "TYPE",
    VAR: "VAR",
    PROCEDURE: "PROCEDURE",
    BEGIN: "BEGIN",
    END: "END",
    ARRAY: "ARRAY",
    OF: "OF",
    RECORD: "RECORD",
    IF: "IF",
    THEN: "THEN",
    ELSE: "ELSE",
    FI: "FI",
    WHILE: "WHILE",
    DO: "DO",
    ENDWH: "ENDWH",
    READ: "READ",
    WRITE: "WRITE",
    RETURN: "RETURN",
    INTEGER: "INTEGER",
    INTC: "INTC",
    CHAR: "CHAR",
    ADD: "+",
    SUB: "-",
    MUL: "*",
    DIV: "/",
    LESS: "<",
    EQUAL: ":",
    LEFT_PARENT: "(",
    RIGHT_PARENT: ")",
    LEFT_BRACKET: "{",
    RIGHT_BRACKET: "}",
    DOT: ".",
    SEMICOLON: ";",
    EOF: "EOF",
    SPACE: " ",
    COLON_EQUAL: ":=",
    LEFT_BRACES: "[",
    RIGHT_BRACES: "]",
    APOSTROPHE: "'",
    TWO_DOT: "..",
    COMMA: ",",
    IDENTIFIERS: "ID",
    KEYWORDS: ["repeat", "program", "type", "var", "procedure", "begin", "end", "array", "of", "record", "if", "then",
        "else", "fi", "while", "do", "endwh", "read", "write", "return", "integer", "char"],
    TYPES: ["repeat", "program", "type", "var", "procedure", "begin", "end", "array", "of", "record", "if", "then",
        "else", "fi", "while", "do", "endwh", "read", "write", "return", "integer", "char", "intc",
        "+", "-", "*", "/", "<", "=", "(", ")", "{", "}", "[", "]", ".", ";", "EOF", " ", ":=", "'", "..", ",", "ID"],
}

function lex(file) {
    let state = STATE.START
    let tokenList = []
    let line = 1
    let nxt = 0
    let length = file.length
    while (nxt < length) {
        if (state === STATE.START) {
            let nxtChar = file[nxt]
            while (nxt < length && (nxtChar === ' ' || nxtChar === '\n' || nxtChar === '\r' || nxtChar === '\t')) {
                if (nxtChar === '\n') {
                    line += 1

                }
                nxt += 1
                if (nxt === length) {
                    break
                }
                nxtChar = file[nxt]
            }
            if (nxt === length) {
                break
            }
            if (/^[a-zA-Z]+$/i.test(nxtChar) || nxtChar === '_') {
                state = STATE.CHAR
            } else if (/^[0-9]+$/i.test(nxtChar)) {
                state = STATE.NUM
            } else {
                if (nxtChar === '.' && nxt + 1 !== length && file[nxt + 1] === '.') {
                    nxt += 1
                    nxtChar = ".."
                } else if (nxtChar === ":" && file[nxt + 1] === '=') {
                    nxt += 1
                    nxtChar = ":="
                } else if (nxtChar === "{") {
                    while (nxtChar !== "}") {
                        nxt += 1
                        nxtChar = file[nxt]
                    }
                    nxt += 1
                    nxtChar = file[nxt]
                    state = STATE.START
                    continue
                }
                if (TOKENTYPE.TYPES.indexOf(nxtChar) !== -1) {
                    tokenList.push([nxtChar, nxtChar, line])
                    nxt += 1
                    state = STATE.START
                } else {
                    console.log(nxt, nxtChar, state, "error", line)
                    break
                }
            }
        } else if (state === STATE.CHAR) {
            let currentId = ""
            let nxtChar = file[nxt]
            while (nxt < file.length && (/^[a-zA-Z]+$/i.test(nxtChar) || /^[0-9]+$/i.test(nxtChar) || nxtChar === '_')) {
                currentId += nxtChar
                nxt += 1
                if (nxt === length) {
                    break
                }
                nxtChar = file[nxt]
            }
            if (TOKENTYPE.KEYWORDS.indexOf(currentId.toLowerCase()) !== -1) {
                tokenList.push([currentId.toUpperCase(), currentId, line])
            } else {
                tokenList.push([TOKENTYPE.IDENTIFIERS, currentId, line])
            }
            state = STATE.START
        } else if (state === STATE.NUM) {
            let currentNum = ""
            let nxtChar = file[nxt]
            while (nxt < file.length && /^[0-9]+$/i.test(nxtChar)) {
                currentNum += nxtChar
                nxt += 1
                if (nxt === length) {
                    break
                }
                nxtChar = file[nxt]
            }
            tokenList.push([TOKENTYPE.INTC, parseInt(currentNum), line])
            state = STATE.START
        }
    }
    return tokenList
}

function main() {
    let data;
    try {
        data = fs.readFileSync('demo.txt', 'utf8')
    } catch (err) {
        console.error(err)
    }
    fs.writeFile("result.txt", JSON.stringify(lex(data)), err => {
        if (!err) console.log("success~");
    });
}

// main()
module.exports = {lex: lex}

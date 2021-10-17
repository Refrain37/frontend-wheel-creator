// parser
const WHITESPACE_REGEXP = /\s/
const NUMBERS_REGEXP = /[0-9]/
const FUNCNAME_REGEXP = /[a-z]/i

const TOKEN_TYPES = {
    PAREN: 'paren',
    NUMBER: 'number',
    STRING: 'string',
    FUNCNAME: 'funcname',
}

const AST_TYPES = {
    PROGRAM: 'program',
    NUMBER_LITERAL: 'numberLiteral',
    STRING_LITERAL: 'stringLiteral',
    CALLEXPRESSION: 'callExpression',
}

class Compiler {
    /* parse: source code -> ast */
    // 1.tokenize: code -> tokens
    // 2.create ast: tokens -> ast
    _parse(code) {
        const tokens = this._tokenize(code)
        return this._creator(tokens)
    }

    _tokenize(code) {
        let curr = 0
        const tokens = []
        class Token {
            constructor(type, value) {
                this.type = type
                this.value = value
            }
        }

        while (curr < code.length) {
            let char = code[curr]

            // 空格
            if (WHITESPACE_REGEXP.test(char)) {
                curr += 1
                continue
            }

            // 左括号
            if (char === '(') {
                tokens.push(new Token(TOKEN_TYPES.PAREN, '('))
                curr += 1
                continue
            }

            // 右括号
            if (char === ')') {
                tokens.push(new Token(TOKEN_TYPES.PAREN, ')'))
                curr += 1
                continue
            }

            // 数字
            if (NUMBERS_REGEXP.test(char)) {
                let num = ''

                // 获取连续值
                while (NUMBERS_REGEXP.test(char)) {
                    num += char
                    char = code[++curr]
                }

                tokens.push(new Token(TOKEN_TYPES.NUMBER, num))
                continue
            }

            // 字符串
            if (char === '"' || char === "'") {
                let chars = ''

                char = code[++curr] // 跳过左引号
                while (char !== '"' || char !== "'") {
                    chars += char
                    char = code[++curr]
                }

                char = code[++curr] // 跳过右引号

                tokens.push(new Token(TOKEN_TYPES.STRING, chars))
                continue
            }

            // 函数名
            if (FUNCNAME_REGEXP.test(char)) {
                let funcName = ''

                while (FUNCNAME_REGEXP.test(char)) {
                    funcName += char
                    char = code[++curr]
                }

                tokens.push(new Token(TOKEN_TYPES.FUNCNAME, funcName))
                continue
            }

            // 无法识别
            throw TypeError('err:char')
        }

        return tokens
    }

    _creator(tokens) {
        let curr = 0

        const ast = {
            type: AST_TYPES.PROGRAM,
            body: [],
        }

        function walk() {
            let token = tokens[curr]

            // number
            if (token.type === TOKEN_TYPES.NUMBER) {
                curr += 1
                return {
                    type: AST_TYPES.NUMBER_LITERAL,
                    value: token.value,
                }
            }

            // string
            if (token.type === TOKEN_TYPES.STRING) {
                curr += 1
                return {
                    type: AST_TYPES.STRING_LITERAL,
                    value: token.value,
                }
            }

            // function
            if (token.type === TOKEN_TYPES.PAREN && token.value === '(') {
                token = tokens[++curr]
                const expression = {
                    type: AST_TYPES.CALLEXPRESSION,
                    name: token.value,
                    params: [],
                }

                token = tokens[++curr]

                // 获取参数
                while (
                    token.type !== TOKEN_TYPES.PAREN ||
                    (token.type === TOKEN_TYPES.PAREN && token.value !== ')')
                ) {
                    expression.params.push(walk())
                    token = tokens[curr]
                }

                curr += 1
                return expression
            }

            throw TypeError('err:create')
        }

        while (curr < tokens.length) {
            ast.body.push(walk())
        }

        return ast
    }

    /* optimize ast */
    _transform(ast) {}

    /* generate: ast -> target code */
    _generate(ast) {}

    baseCompile(code) {
        const ast = this._parse(code)
        console.log(ast)
        this._transform(ast)
        return this._generate(ast)
    }
}

/* ------test-------- */
const code = `(add 2 (subtract 4 2))`
const compiler = new Compiler()
const res = compiler.baseCompile(code)
console.log(res)
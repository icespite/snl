const {Symbol, SymbolTable, ArrayType, BaseType, RecordType} = require("./symbol")
const {AST, convertToPng} = require("../grammar/ll1-newone")
const fs = require('fs')
const {lex} = require("../lexer/lexer")

const ERRORTYPE = {
    ARRAYDEFINEERROR: " 数组定义非法 ",
    DUPLICATEDEFINE: " 重复定义 ",
    UNDEFINEDTYPE: " 未定义的类型 ",
}

class Analyze {
    constructor(tokens, root) {
        this.index = 0
        this.tokens = tokens
        this.root = root
        this.symTable = new SymbolTable()
        this.current = root
        this.scope = [this.symTable]
        this.errorMessage = ""
        this.currentVarType = ""
        this.currentVarKind = ""
        this.currentExp = ""
        this.currentVarValue = ""
        this.currentVar = null
        this.printerror = true
        this.symLevel = 0
        this.errorLine = 0
    }

    updateIndex() {
        if (this.current.getTokenVal() !== 'ε' && (this.current.getTokenVal() !== "" || this.current.getTokenVal() === 0)) {
            this.index += 1
        }
    }

    step() {
        // 没有儿子就找兄弟,没有兄弟就找父亲
        if (this.current.isEmpty()) {
            this.current = this.current.step()
        } else {
            this.current = this.current.firstChild()
        }
        this.updateIndex()
    }

    goto(tokenType) {
        while (!this.current.isTokenType(tokenType)) {
            this.step()
        }
    }

    analyze() {
        this.current = this.root.firstChild()
        this.processHead()
        this.processDeclare()
        // TODO:未完成
        // this.processProgramBody()
    }

    processHead() {
        this.goto("ProgramName")
        this.goto("ID")
    }

    processDeclare() {
        this.goto("DeclarePart")
        this.processTypeDec()
        this.processVarDec()
        // TODO:未完成
        // this.processProcDec()
    }

    processProgramBody() {
        this.goto("BEGIN")
        this.stmList()
        this.goto("END")
    }

    processTypeDec() {
        this.goto("TypeDec")
        this.step()
        if (this.current.isTokenType("ε")) {
            // 没有类型定义
            return
        } else {
            this.goto("TypeDecList")
            while (true) {
                if (this.current.isTokenType("TypeDecMore") && this.current.firstChild().isTokenType("ε")) {
                    break
                } else {
                    this.goto("TypeId")
                    this.goto("ID")
                    let sym = new Symbol(this.current.getTokenVal(), "typeDec")
                    let typeName = this.getAndCheckTypeName()
                    if (typeName !== null) {
                        sym.typePtr = typeName
                        if (!this.symTable.contains(sym.name)) {
                            this.symTable.add(sym)
                        } else {
                            this.errorMessage = ERRORTYPE.DUPLICATEDEFINE + sym.name
                            this.consoleError()
                        }
                    }
                    this.goto("TypeDecMore")
                }
            }
        }
    }

    getCurrentToken() {
        if (this.index - 1 > 0) {
            return this.tokens[this.index - 1][1]
        }
        return null
    }

    consoleError(type = null) {
        if (type !== null) {
            console.log("analyze error: line ", this.tokens[this.index - 1][2], " decKind: ", type.decKind, " name: ", type.name, " msg: ", this.errorMessage)
        } else {
            console.log("analyze error：line ", this.tokens[this.index - 1][2], " token: ", this.getCurrentToken(), " msg: ", this.errorMessage)
        }
        // process.exit()
    }

    getAndCheckBaseType() {
        this.goto("BaseType")
        this.step()
        return new BaseType(1, this.current.getTokenType())
    }

    getAndCheckArrayType() {
        this.goto("ArrayType")
        this.goto("Low")
        this.goto("INTC")
        let low = this.current.getTokenVal()
        this.goto("Top")
        this.goto("INTC")
        top = this.current.getTokenVal()
        this.goto("BaseType")
        this.step()
        let bType = new BaseType(1, this.current.getTokenType())
        let typePtr = new ArrayType(top - low, low, top, bType)

        // 数组定义非法
        if (low < 0 || (low >= top)) {
            this.errorMessage = ERRORTYPE.ARRAYDEFINEERROR
            this.consoleError()
            return null
        } else {
            return typePtr
        }
    }

    getAndCheckTypeName() {
        this.goto("TypeName")
        let choice = this.current.firstChild().getTokenType()
        this.goto(choice)
        if (choice === "ID") {
            // 如果右边是id则要检查下id是否存在
            let idName = this.current.getTokenVal()
            if (this.symTable.contains(idName)) {
                return this.symTable.get(idName).typePtr
            } else {
                //id不存在
                this.errorMessage = ERRORTYPE.UNDEFINEDTYPE
                this.consoleError()
                this.printerror = false
                return null
            }
        } else if (choice === "BaseType") {
            return this.getAndCheckBaseType()
        } else if (choice === "StructureType") {
            let structType = this.current.firstChild().getTokenType()
            this.goto(structType)
            if (structType === "ArrayType") {
                return this.getAndCheckArrayType()
            } else if (structType === "RecType") {
                let fieldList = new SymbolTable()
                this.goto("RECORD")
                while (true) {
                    if (this.current.isTokenType("FieldDecMore") && this.current.firstChild().isTokenType("ε")) {
                        break
                    } else {
                        this.goto("FieldDecList")
                        let fieldTypeKind = this.current.firstChild().getTokenType()
                        let fieldType = null
                        if (fieldTypeKind === "BaseType") {
                            fieldType = this.getAndCheckBaseType()
                        } else if (fieldTypeKind === "ArrayType") {
                            fieldType = this.getAndCheckArrayType()
                        }
                        while (true) {
                            if (this.current.isTokenType("IdMore") && this.current.firstChild().isTokenType("ε")) {
                                break
                            } else {
                                this.goto("IdList")
                                this.goto("ID")
                                let sym = new Symbol(this.current.getTokenVal(), "varDec", fieldType)
                                if (fieldList.contains(sym)) {
                                    this.errorMessage = ERRORTYPE.DUPLICATEDEFINE + sym.name
                                    this.consoleError(sym)
                                } else {
                                    fieldList.add(sym)
                                }
                                this.goto("IdMore")
                            }
                        }
                        this.goto("FieldDecMore")
                    }
                }
                this.goto("END")
                let recType = new RecordType(null, fieldList)
                return recType
            }
        }
    }

    processVarDec() {
        this.goto("VarDec")
        this.step()
        if (this.current.isTokenType("ε")) {
            return
        } else {
            this.goto("VarDecList")
            while (true) {
                if (this.current.isTokenType("VarDecMore") && this.current.firstChild().isTokenType("ε")) {
                    break
                } else {
                    let typeName = this.getAndCheckTypeName()
                    this.goto("VarIdList")
                    while (true) {
                        if (this.current.isTokenType("VarIdMore") && this.current.firstChild().isTokenType("ε")) {
                            break
                        } else {
                            let sym = new Symbol(typeName, "varDec")
                            this.goto("ID")
                            sym.name = this.current.getTokenVal()
                            if (this.symTable.contains(sym.name)) {
                                this.errorMessage = ERRORTYPE.DUPLICATEDEFINE
                                this.consoleError()
                            } else {
                                this.symTable.add(sym)
                            }
                            this.goto("VarIdMore")
                        }
                    }
                    this.goto("VarDecMore")
                }

            }
        }
    }

    processProcDec() {
        let curSymTab = this.symTable
        this.goto("ProcDec")
        this.step()
        if (this.current.isTokenType("ε")) {
            return
        } else {
            while (true) {
                if (this.current.isTokenType("ProcDecMore") && this.current.firstChild().isTokenType("ε")) {
                    break
                } else {
                    this.goto("ProcName")
                    this.step()
                    let procName = this.current.getTokenVal()
                    let proc = new Symbol(procName, "procDec", new SymbolTable())
                    let symTable = new SymbolTable()
                    symTable.add(proc)
                    let procError = false
                    if (this.symTable.contains(procName)) {
                        procError = true
                        this.errorMessage = ERRORTYPE.DUPLICATEDEFINE
                        this.consoleError()
                    } else {
                        this.symTable.add(proc)
                        this.scope.append(symTable)
                        this.symTable = this.scope[this.scope.length - 1]
                    }
                    this.goto("ParamList")
                    this.step()
                    if (this.current.isTokenType("ε")) {

                    } else {
                        this.goto("Param")
                        let typeName = this.getAndCheckTypeName()
                        let typeError = false
                        if (typeName == null) {
                            typeError = true
                        }
                        this.goto("FormList")
                        while (true) {
                            if (this.current.isTokenType("FidMore") && this.current.firstChild().isTokenType("ε")) {
                                break
                            } else {
                                this.goto("ID")
                                let param = new Symbol(this.current.getTokenVal(), "varDec", typeName)
                                proc.param.add(param)
                                if (!procError && !typeError) {
                                    if (!this.symTable.contains(param.name)) {
                                        this.symTable.add(param)
                                    } else {
                                        this.error = true
                                        this.errorMessage = ERRORTYPE.DUPLICATEDEFINE
                                        this.consoleError()
                                    }
                                }
                                this.goto("FidMore")
                            }
                        }
                        this.goto("ParamMore")
                    }
                    this.goto("ProcDecPart")
                    this.processDeclare()
                    this.goto("ProcBody")
                    this.processProgramBody()
                    this.symTable = curSymTab
                    this.goto("ProcDecMore")
                }
            }
        }
    }

    stmList() {
        this.goto("Stm")
        while (true) {
            if (this.current.isTokenType("StmMore") && this.current.firstChild().isTokenType("ε")) {
                break
            } else {
                this.goto("Stm")
                let curStm = this.current.firstChild().getTokenType()
                switch (curStm) {
                    case "ConditionalStm":
                        this.conditionalStm();
                        break;
                    case "LoopStm":
                        this.loopStm();
                        break;
                    case  "InputStm":
                        this.inputStm();
                        break;
                    case "OutputStm":
                        this.outputStm()
                        break;
                    case   "ReturnStm":
                        this.returnStm()
                        break;
                    case "ID": {
                        this.goto("ID")
                        let idName = this.current.getTokenVal()
                        this.goto("AssCall")
                        this.step()
                        let decision = this.current.getTokenType()
                        let varError = true
                        let varr = null
                        let temp = this.scope.clone().reverse()
                        temp.forEach(it => {
                            if (it.contains(idName)) {
                                varError = false
                                varr = it.get(idName)
                            }
                        })
                        if (varError) {
                            this.error = true
                            this.errorMessage = ERRORTYPE.unDefinedVar
                            this.consoleError()
                        }
                        if (decision === "AssignmentRest") {
                            let varType = null
                            this.goto("VariMore")
                            this.step()
                            let choice = this.current.getTokenType()
                            if (choice === "ε") {
                                if (!varError) {
                                    varType = varr.typePtr.type
                                }
                            } else if (choice == "[") {
                                let indType, indVal = this.expresion()

                            }
                        }

                        break;
                    }
                }
            }
        }
    }
}

function main() {
    let data;
    try {
        data = fs.readFileSync('start-error.txt', 'utf8')
    } catch (err) {
        console.error(err)
    }
    let tokens = lex(data)

    fs.writeFileSync("lexer-result.txt", JSON.stringify(tokens));

    let root = AST(tokens, true)
    convertToPng(root)
    let analyzer = new Analyze(tokens, root);
    analyzer.analyze();
    console.log("success~")
}

main()

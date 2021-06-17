const fs = require('fs')
const {AstNode} = require("./AST");
const graphviz = require('graphviz');
const GRAMMAR = require("./define");

const ll1Table = JSON.parse(data);

function First(left) {
    let result = new Set()
    if (GRAMMAR["VT"].indexOf(left) !== -1 || left === 'ε') {
        result.add(left)
        return result
    } else {
        let right = GRAMMAR["GRAMMAR"][left]
        if (right !== undefined) {
            for (let i = 0; i < right.length; i++) {
                let oneRightSet = right[i]
                for (let j = 0; j < oneRightSet.length; j++) {
                    let oneRightElementFirst = First(oneRightSet[j])
                    if (oneRightElementFirst.has("ε")) {
                        if (j !== oneRightSet.length - 1) {
                            oneRightElementFirst.delete("ε")
                        }
                        oneRightElementFirst.forEach(it => {
                            result.add(it)
                        })
                    } else {
                        oneRightElementFirst.forEach(it => {
                            result.add(it)
                        })
                        break
                    }
                }
            }
        }
    }
    return result
}

function Follow() {
    let allFollowSet = {}
    for (let vn of GRAMMAR["VN"]) {
        allFollowSet[vn] = new Set()
    }
    allFollowSet[GRAMMAR["BEGIN"]].add("#")
    let done = false
    while (!done) {
        let preStatus = []
        let tempNum = 0;
        for (let key in allFollowSet) {
            preStatus[tempNum] = allFollowSet[key].size
            tempNum++
        }
        for (let left in GRAMMAR["GRAMMAR"]) {
            let rightSets = GRAMMAR["GRAMMAR"][left]
            for (let i = 0; i < rightSets.length; i++) {
                let oneRightSet = rightSets[i]
                for (let j = 0; j < oneRightSet.length; j++) {
                    let oneRightSetElement = oneRightSet[j]
                    // 不是非终极符直接pass
                    if (GRAMMAR["VN"].indexOf(oneRightSetElement) !== -1) {
                        // 右边为 ε ，直接加上Follow(A)
                        if (j === oneRightSet.length - 1) {
                            allFollowSet[left].forEach(value => {
                                allFollowSet[oneRightSetElement].add(value)
                            })
                        } else {
                            let k = j + 1
                            let backOneRightElement = oneRightSet[k]
                            let backOneRightElementFirstSet = First(backOneRightElement)
                            // 用 A -> aBC 来说就是，当前扫描到 B 了，而 B 的右侧有非终结符 C，则将去掉 ε 的 First（C）加入 Follow（B）中。
                            while (k < oneRightSet.length && backOneRightElementFirstSet.has('ε')) {
                                backOneRightElementFirstSet.delete('ε')
                                backOneRightElementFirstSet.forEach(it => {
                                    allFollowSet[oneRightSetElement].add(it)
                                })
                                k += 1
                                // 存在 C -> ε  ，则将 Follow（A）也加入 Follow（B）中。
                                if (k === oneRightSet.length) {
                                    for (let value of allFollowSet[left].values()) {
                                        allFollowSet[oneRightSetElement].add(value)
                                    }
                                    break
                                }
                                backOneRightElement = oneRightSet[k]
                                backOneRightElementFirstSet = First(backOneRightElement)
                            }
                            // 后面字符的first集合不含有 ε ，直接加入 First（C）
                            backOneRightElementFirstSet.forEach(it => {
                                allFollowSet[oneRightSetElement].add(it)
                            })
                        }
                    }
                }
            }
        }

        let curStatus = []
        tempNum = 0;
        for (let key in allFollowSet) {
            curStatus[tempNum] = allFollowSet[key].size
            tempNum++
        }

        done = true
        for (let k = 0; k < curStatus.length; k++) {
            if (curStatus[k] !== preStatus[k]) {
                done = false
                break
            }
        }
    }
    return allFollowSet
}

function LL1Table() {
    let firstTable = {}
    let ll1Ttable = {}
    for (let vn of GRAMMAR["VN"]) {
        firstTable[vn] = First(vn)
        ll1Ttable[vn] = {}
        for (let vt of GRAMMAR["VT"]) {
            ll1Ttable[vn][vt] = "error"
        }
    }
    let followTable = Follow()

    for (let left in GRAMMAR["GRAMMAR"]) {
        let rightSets = GRAMMAR["GRAMMAR"][left]
        let sonNum = rightSets.length
        for (let i = 0; i < sonNum; i++) {
            let oneRightSet = rightSets[i]
            let head = oneRightSet[0]

            // 右边第一个符号是终极符，所以右边的First集合（predict集合）就是该终极符
            if (GRAMMAR["VT"].indexOf(head) !== -1) {
                ll1Ttable[left][head] = oneRightSet
            } else {
                let predictSet = new Set()
                for (let element of oneRightSet) {
                    if (GRAMMAR["VN"].indexOf(element) !== -1) {
                        let temp = new Set(firstTable[element])
                        if (temp.has("ε")) {
                            temp.delete('ε')
                            for (let value of temp) {
                                predictSet.add(value)
                            }
                            if (oneRightSet.indexOf(element) === oneRightSet.length - 1) {
                                followTable[left].forEach(value => {
                                    predictSet.add(value)
                                })
                            }
                        } else {
                            for (let value of temp) {
                                predictSet.add(value)
                            }
                            break
                        }
                    } else if (element === 'ε') {
                        if (oneRightSet.indexOf(element) === oneRightSet.length - 1) {
                            followTable[left].forEach(value => {
                                predictSet.add(value)
                            })
                        }
                    } else if (GRAMMAR["VT"].indexOf(element) !== -1) {
                        predictSet.add(element)
                        break
                    }
                }
                for (let pre of predictSet) {
                    ll1Ttable[left][pre] = oneRightSet
                }
            }
        }
    }
    return ll1Ttable
}

function AST(tokens, printStack) {
    let tokenStack = []
    tokens.forEach(token => {
        let tokenType = token[1]
        tokenStack.push(tokenType)
    })
    let table
    table = LL1Table()
    console.log(table)
    let stack = [GRAMMAR["BEGIN"]]
    let root = new AstNode(GRAMMAR["BEGIN"])
    let current = root
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i]
        let tokenType = token[0]
        let tokenVal = token[1]
        let done = false
        let error = false
        while (!done) {
            if (printStack) {
                console.log(stack, token)
            }
            top = stack.pop()
            if (printStack) {
                console.log(stack, token)
            }
            if (top === undefined) {
                console.log("Error!,stack is empty")
                return
            }
            while (top === "ε") {
                top = stack.pop()
                if (printStack) {
                    console.log(stack, token)
                }
                current.insertChild(new AstNode("ε", "ε"))
                current = current.step()
            }
            if (top === tokenType) {
                done = true
                tokenStack.pop()
                current.tokenType = tokenType
                current.tokenVal = tokenVal
                current = current.step()
                break
            }

            let choice = table[top][tokenType]

            if (choice === "error") {
                done = true
                error = true
                console.log("ll1 error", token, top, tokenType)
                process.exit(2)
            } else {
                for (let i = choice.length - 1; i >= 0; i--) {
                    stack.push(choice[i])
                }
                choice.forEach(it => {
                    current.insertChild(new AstNode(it))
                })

                current = current.child[0]
            }
        }
    }
    return root
}


function convertToPng(root) {
    let current = root
    const graph = graphviz.digraph("AST");
    let stack = []
    stack.push(current)
    while (stack.length !== 0) {
        let node = stack.pop()
        let color = "black"
        let name = "node" + node.id.value
        let label = node.tokenType
        if (label === "ε" && node.child.length === 0) {
            color = "red"
        } else if (GRAMMAR["VT"].indexOf(label) !== -1) {
            color = "red"
            if (["INTC", "ID"].indexOf(label) !== -1) {
                label = label + " : " + node.tokenVal
            }
        }
        graph.addNode(name, {"color": color, "label": label})
        node.child.forEach(it => {
            let sonName = "node" + it.id.value
            stack.push(it)
            graph.addEdge(name, sonName)
        })

    }
    // console.log(graph.to_dot());
    graph.output("png", "AST.png");
}

function main() {
    let tokens;
    try {
        tokens = fs.readFileSync('../lexer/result.txt', 'utf8')
    } catch (err) {
        console.error(err)
    }
    var result = AST(JSON.parse(tokens), true)
    convertToPng(result)
    console.log("success~")
}

// main()
module.exports = {first: First, follow: Follow, Table: LL1Table, AST, ll1Main: main, convertToPng}

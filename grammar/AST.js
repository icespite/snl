function* makeRangeIterator(start = 0, end = Infinity, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

const count = makeRangeIterator(0, 10000, 1);

class AstNode {
    constructor(tokenType, tokenVal = "", father = null) {
        this.tokenType = tokenType
        this.tokenVal = tokenVal
        this.father = father
        this.child = []
        this.brother = []
        this.id = count.next()
    }

    insertChild(node) {
        this.child.push(node)
        node.brother = this.child
        node.father = this
    }

    step() {
        let cur = this
        while (cur.id.value !== 0 && cur.brother.indexOf(cur) === cur.brother.length - 1) {
            cur = cur.father
        }
        if (cur.id.value !== 0) {
            cur = cur.brother[cur.brother.indexOf(cur) + 1]
        }
        return cur
    }

    dump(depth = 0) {
        let content = depth > 0 ? "".padStart(depth * 3, ' ') + "|" : ""
        content = content + "  " + this.tokenType + "  " + this.tokenVal
        content += "\n"
        this.child.forEach(it => {
            content += it.dump(depth + 1)
        })
        return content
    }

    firstChild() {
        if (this.child.length === 0) {
            console.log("No Child")
            return
        } else {
            return this.child[0]
        }
    }

    getTokenVal() {
        return this.tokenVal
    }

    getTokenType() {
        return this.tokenType
    }

    isTokenType(tokenType) {
        return this.tokenType === tokenType
    }

    isEmpty() {
        return this.child.length === 0
    }
}

module.exports = {AstNode}

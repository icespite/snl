class Symbol {
    constructor(name = null, kind = null, type = null, value = null, access = null, level = null, offset = null, param = null, Class = null, code = null, Size = null, forward = null) {
        this.name = name
        this.decKind = kind
        this.typePtr = type
        this.value = value
        this.access = access
        this.level = level
        this.offset = offset
        this.param = param
        this.Class = Class
        this.code = code
        this.Size = Size
        this.forward = forward
    }
}

class SymbolTable {
    constructor() {
        this.table = []
    }

    add(symbol) {
        this.table.push(symbol)
    }

    contains(item) {
        for (let sym of this.table) {
            if (item === sym.name || (item.name !== undefined && item.name === sym.name)) {
                return true
            }
        }
        return false
    }

    pop() {
        return this.table.pop()
    }

    remove(name) {
        for (let i = 0; i < this.table.length; i++) {
            if (this.table[i].name === name) {
                this.table.splice(i, 1)
                break
            }
        }
    }

    top() {
        return this.table[this.table.length - 1]
    }

    get(name) {
        let length = this.table.length
        for (let i = 0; i < length; i++) {
            if (this.table[i].name === name) {
                return this.table[i]
            }
        }
        return null
    }

}

class BaseType {
    constructor(size = 1, kind = null) {
        this.size = size
        this.type = kind
    }
}

class ArrayType {
    constructor(size = null, low = null, top = null, element = null) {
        this.size = size
        this.type = "arrayType"
        this.low = low
        this.top = top
        this.element = element
    }
}

class RecordType {
    constructor(size = null, fieldList = null) {
        this.type = "recordType"
        this.size = size
        this.fieldList = fieldList
    }
}

module.exports = {Symbol, SymbolTable, ArrayType, BaseType, RecordType}

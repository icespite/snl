GRAMMAR = {
    "BEGIN": "Program",
    "GRAMMAR": {
        'Program': [['ProgramHead', 'DeclarePart', 'ProgramBody', '.']],
        'ProgramHead': [['PROGRAM', 'ProgramName']],
        'ProgramName': [['ID']],
        'DeclarePart': [['TypeDec', 'VarDec', 'ProcDec']],
        'TypeDec': [['ε'], ['TypeDeclaration']],
        'TypeDeclaration': [['TYPE', 'TypeDecList']],
        'TypeDecList': [['TypeId', '=', 'TypeName', ';', 'TypeDecMore']],
        'TypeDecMore': [['ε'], ['TypeDecList']],
        'TypeId': [['ID']],
        'TypeName': [['BaseType'], ['StructureType'], ['ID']],
        'BaseType': [['INTEGER'], ['CHAR']],
        'StructureType': [['ArrayType'], ['RecType']],
        'ArrayType': [['ARRAY', '[', 'Low', '..', 'Top', ']', 'OF', 'BaseType']],
        'Low': [['INTC']],
        'Top': [['INTC']],
        'RecType': [['RECORD', 'FieldDecList', 'END']],
        'FieldDecList': [
            ['BaseType', 'IdList', ';', 'FieldDecMore'],
            ['ArrayType', 'IdList', ';', 'FieldDecMore']
        ],
        'FieldDecMore': [['ε'], ['FieldDecList']],
        'IdList': [['ID', 'IdMore']],
        'IdMore': [['ε'], [',', 'IdList']],
        'VarDec': [['ε'], ['VarDeclaration']],
        'VarDeclaration': [['VAR', 'VarDecList']],
        'VarDecList': [['TypeName', 'VarIdList', ';', 'VarDecMore']],
        'VarDecMore': [['ε'], ['VarDecList']],
        'VarIdList': [['ID', 'VarIdMore']],
        'VarIdMore': [['ε'], [',', 'VarIdList']],
        'ProcDec': [['ε'], ['ProcDeclaration']],
        'ProcDeclaration': [
            ['PROCEDURE', 'ProcName', '(', 'ParamList', ')', ';', 'ProcDecPart', 'ProcBody',
                'ProcDecMore'
            ]
        ],
        'ProcDecMore':
            [['ε'], ['ProcDeclaration']],
        'ProcName':
            [['ID']],
        'ParamList':
            [['ε'], ['ParamDecList']],
        'ParamDecList':
            [['Param', 'ParamMore']],
        'ParamMore':
            [['ε'], [';', 'ParamDecList']],
        'Param':
            [['TypeName', 'FormList'], ['VAR', 'TypeName', 'FormList']],
        'FormList':
            [['ID', 'FidMore']],
        'FidMore':
            [['ε'], [',', 'FormList']],
        'ProcDecPart':
            [['DeclarePart']],
        'ProcBody':
            [['ProgramBody']],
        'ProgramBody':
            [['BEGIN', 'StmList', 'END']],
        'StmList':
            [['Stm', 'StmMore']],
        'StmMore':
            [['ε'], [';', 'StmList']],
        'Stm':
            [
                ['ConditionalStm'], ['LoopStm'], ['InputStm'],
                ['OutputStm'],
                ['ReturnStm'],
                ['ID', 'AssCall']
            ],
        'AssCall':
            [['AssignmentRest'], ['CallStmRest']],
        'AssignmentRest':
            [['VariMore', ':=', 'Exp']],
        'ConditionalStm':
            [['IF', 'RelExp', 'THEN', 'StmList', 'ELSE', 'StmList', 'FI']],
        'LoopStm':
            [['WHILE', 'RelExp', 'DO', 'StmList', 'ENDWH']],
        'InputStm':
            [['READ', '(', 'Invar', ')']],
        'Invar':
            [['ID']],
        'OutputStm':
            [['WRITE', '(', 'Exp', ')']],
        'ReturnStm':
            [['RETURN', '(', 'Exp', ')']],
        'CallStmRest':
            [['(', 'ActParamList', ')']],
        'ActParamList':
            [['ε'], ['Exp', 'ActParamMore']],
        'ActParamMore':
            [['ε'], [',', 'ActParamList']],
        'RelExp':
            [['Exp', 'OtherRelE']],
        'OtherRelE':
            [['CmpOp', 'Exp']],
        'Exp':
            [['Term', 'OtherTerm']],
        'OtherTerm':
            [['ε'], ['AddOp', 'Exp']],
        'Term':
            [['Factor', 'OtherFactor']],
        'OtherFactor':
            [['ε'], ['MultOp', 'Term']],
        'Factor':
            [['(', 'Exp', ')'], ['INTC'], ['Variable']],
        'Variable':
            [['ID', 'VariMore']],
        'VariMore':
            [['ε'], ['[', 'Exp', ']'], ['.', 'FieldVar']],
        'FieldVar':
            [['ID', 'FieldVarMore']],
        'FieldVarMore':
            [['ε'], ['[', 'Exp', ']']],
        'CmpOp':
            [['<'], ['=']],
        'AddOp':
            [['+'], ['-']],
        'MultOp':
            [['*'], ['/']]
    }
    ,
    "VN":
        ["ActParamList", "ActParamMore", "AddOp", "ArrayType", "AssCall", "AssignmentRest", "BaseType", "CallStmRest",
            "CmpOp", "ConditionalStm", "DeclarePart", "Exp", "Factor", "FidMore", "FieldDecList", "FieldDecMore",
            "FieldVar", "FieldVarMore", "FormList", "IdList", "IdMore", "InputStm", "Invar", "LoopStm", "Low", "MultOp",
            "OtherFactor", "OtherRelE", "OtherTerm", "OutputStm", "Param", "ParamDecList", "ParamList", "ParamMore",
            "ProcBody", "ProcDec", "ProcDecMore", "ProcDecPart", "ProcDeclaration", "ProcName", "Program", "ProgramBody",
            "ProgramHead", "ProgramName", "RecType", "RelExp", "ReturnStm", "Stm", "StmList", "StmMore", "StructureType",
            "Term", "Top", "TypeDec", "TypeDecList", "TypeDecMore", "TypeDeclaration", "TypeId", "TypeName", "VarDec",
            "VarDecList", "VarDecMore", "VarDeclaration", "VarIdList", "VarIdMore", "VariMore", "Variable"],

    "VT":
        ["(", ")", "*", "+", ",", "-", ".", "..", "/", ":=", ";", "<", "=", "ARRAY", "BEGIN", "CHAR", "DO", "ELSE",
            "END", "ENDWH", "FI", "ID", "IF", "INTC", "INTEGER", "OF", "PROCEDURE", "PROGRAM", "READ", "RECORD",
            "RETURN", "THEN", "TYPE", "VAR", "WHILE", "WRITE", "[", "]"]
}
module.exports = GRAMMAR

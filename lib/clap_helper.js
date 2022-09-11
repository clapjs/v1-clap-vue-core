export default class clap_helper {
    static getQueryString(name){
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
        let r = window.location.search.substr(1).match(reg)
        if (r != null) {
            return unescape(r[2])
        }
        return null
    }
    static listToTree(data, pId, options={}) {
        options.idKey = options.idKey ? options.idKey : '_id'
        options.pIdKey = options.pIdKey ? options.pIdKey : 'p_id'
        options.childKey = options.childKey ? options.childKey : 'children'
        let result = []
        let temp = []
        for (let i = 0; i < data.length; i++) {
            if (data[i][options.pIdKey] == pId) {
                let obj = data[i]
                if (options.replaceFields) {
                    const getValue = (data, keys) => {
                        let value = []
                        for (let key of keys.split(',')) {
                            value.push(eval('data.' + key))
                        }
                        return value.join(' | ')
                    }
                    if (options.replaceFields.key) obj['key'] = getValue(data[i], options.replaceFields.key)
                    if (options.replaceFields.value) obj['value'] = getValue(data[i], options.replaceFields.value)
                    if (options.replaceFields.title) obj['title'] = getValue(data[i], options.replaceFields.title)
                }
                temp = this.listToTree(data, data[i][options.idKey], options)
                if (temp.length > 0) {
                    obj[options.childKey] = temp
                }
                result.push(obj)
            }
        }
        return result
    }

    static getTreeNode(treeData, value, options={}){
        let node
        options = options ? options : {}
        options.key = options.key ? options.key : 'key'
        options.childKey = options.childKey ? options.childKey : 'children'
        for (let data of treeData) {
            if (data[options.key] === value) {
                node = data
            }
            if (data[options.childKey]) {
                let result = this.getTreeNode(data[options.childKey], value, options)
                if (result) {
                    node = result
                }
            }
        }
        return node
    }

    static getTreeParentNode(data, pid, options = {}){
        let result = ''
        options.idKey = options.idKey ? options.idKey : '_id'
        options.pIdKey = options.pIdKey ? options.pIdKey : 'p_id'
        for (let i = 0; i < data.length; i++) {
            if (data[i][options.idKey] == pid) {
                if (data[i][options.pIdKey] != 0) {
                    result += (getTreeParentNode(data, data[i][options.pIdKey]), options)
                }
                if (data[i][options.pIdKey] == 0) {
                    result = data[i][options.idKey]
                } else {
                    result += ',' + data[i][options.idKey]
                }
            }
        }
        return result
    }

    static getTreeLength(tree, options){
        let count = 0
        options = options ? options : {}
        options.childKey = options.childKey ? options.childKey : 'children'
        for (let t of tree) {
            count++
            if (t[options.childKey]) {
                count = count + this.getTreeLength(t[options.childKey], options)
            }
        }
        return count
    }
}

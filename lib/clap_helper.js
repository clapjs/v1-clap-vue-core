import {v1 as uuid} from 'uuid'
export default class clap_helper {
    static getQueryString(name){
        let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
        let r = window.location.search.substr(1).match(reg)
        if (r != null) {
            return unescape(r[2])
        }
        return null
    }
    static listToTree(nodesArray, pKey, options={}) {
        options.key = options.key ? options.key : 'key'
        options.pKey = options.pKey ? options.pKey : 'p_key'
        options.children = options.children ? options.children : 'children'
        let nodes = [];
        for (let i = 0; i < nodesArray.length; i++) {
            if(nodesArray[i].hasOwnProperty('_id')&&!nodesArray[i]['key']) nodesArray[i]['key']=nodesArray[i]._id;
            if(nodesArray[i].hasOwnProperty('p_id')&&!nodesArray[i]['p_key']) nodesArray[i]['p_key']=nodesArray[i].p_id;
            if (nodesArray[i][options.pKey] == pKey) {
                if (options.replaceFields) {
                    const getValue = (data, keys) => {
                        let value = []
                        for (let key of keys.split(',')) {
                            value.push(eval('data.' + key))
                        }
                        return value.join(' | ')
                    }
                    if (options.replaceFields.value) nodesArray[i]['value'] = getValue(nodesArray[i], options.replaceFields.value)
                    if (options.replaceFields.title) nodesArray[i]['title'] = getValue(nodesArray[i], options.replaceFields.title)
                }
                let temp = this.listToTree(nodesArray, nodesArray[i][options.key], options)
                if (temp.length > 0) {
                    nodesArray[i][options.children] = temp
                }
                nodes.push(nodesArray[i])
            }
        }
        return nodes
    }

    static getTreeNode(nodes, nodeKey, options={}){
        let node;
        options.key = options.key ? options.key : 'key'
        options.children = options.children ? options.children : 'children'
        for (let data of nodes) {
            if (data[options.key] === nodeKey) {
                node = data
            }
            if (!node&&data[options.children]) {
                node = this.getTreeNode(data[options.children], nodeKey, options)
            }
        }
        return node
    }

    static getTreeLength(nodes,options,filterKey,filterValue){
        let count = 0
        options = options ? options : {}
        options.children = options.children ? options.children : 'children'
        for (let node of nodes) {
            if(filterKey){
                if(node[filterKey]===filterValue){
                    count++
                }
            }else{
                count++
            }
            if (node[options.children]) {
                count = count + this.getTreeLength(node[options.children], options,filterKey,filterValue)
            }
        }
        return count
    }

    static updateTreeNode(nodes, nodeKey,node, options={}){
        options = options ? options : {}
        options.key = options.key ? options.key : 'key'
        options.children = options.children ? options.children : 'children'
        for (let index in nodes) {
            if (nodes[index][options.key] == nodeKey) {
                nodes[index]=node
            }
            else if (nodes[index][options.children]) {
                nodes[index][options.children] = this.updateTreeNode(nodes[index][options.children], nodeKey,node, options)
            }
        }
        return nodes
    }

    static removeTreeNode(nodes, nodeKey, options={}){
        options = options ? options : {}
        options.key = options.key ? options.key : 'key'
        options.children = options.children ? options.children : 'children'
        for (let index in nodes) {
            if (nodes[index][options.key] == nodeKey) {
                nodes.splice(index, 1);
            }
            else if (nodes[index][options.children]) {
                nodes[index][options.children] = this.removeTreeNode(nodes[index][options.children], nodeKey, options)
            }
        }
        return nodes
    }
    static getTreeParentNode(nodes, nodeKey, options = {}){
        let pNode = '0';
        options.key = options.key ? options.key : 'key'
        options.children = options.children ? options.children : 'children';
        for(let node of nodes){
            if(node[options.children]&&node[options.children].length>0){
                for(let childNode of node[options.children]){
                    if(childNode[options.key]==nodeKey){
                        pNode=node;
                        break;
                    }else{
                        pNode=this.getTreeParentNode([childNode],nodeKey,options)
                    }
                }
            }
        }
        return pNode
    }
    static getTreeParentNodes(nodes, nodeKey, options = {}){
        let pNodes = [];
        options.key = options.key ? options.key : 'key'
        options.children = options.children ? options.children : 'children';
        let pNode=this.getTreeParentNode(nodes, nodeKey, options);
        pNodes.push(pNode);
        if(pNode!='0'){
            pNodes=[...pNodes,...this.getTreeParentNodes(nodes, pNode[options.key], options)]
        }
        return pNodes
    }

    static getTreeParentNodesByArray(data, pid, options = {}){
        let result = ''
        options.key = options.key ? options.key : 'key'
        options.pKey = options.pKey ? options.pKey : 'p_key'
        for (let i = 0; i < data.length; i++) {
            if (data[i][options.key] == pid) {
                if (data[i][options.pKey] != 0) {
                    result += (this.getTreeParentNodesByArray(data, data[i][options.pKey]), options)
                }
                if (data[i][options.pKey] == 0) {
                    result = data[i][options.key]
                } else {
                    result += ',' + data[i][options.key]
                }
            }
        }
        return result
    }

    static getJsonValue(json, keys){
        let value = [];
        keys=Array.isArray(keys)?keys:keys.split(',');
        for (let key of keys) {
            try {
                value.push(eval('json.' + key))
            }
            catch (e) {
                console.log(e, key)
            }
        }
        return value.join(' | ')
    }

    static async resolveFilter (filterArray){
        let filter = filterArray.length > 1 ? { $or: [] } : {}
        for (let child of filterArray) {
            let conditions = { $and: [] }
            for (let c of child) {
                if (c.value === '') {
                    c.value = null
                }
                let condition = {}
                if (c.symbol === '$in' || c.symbol === '$nin') {
                    condition[c.key] = { [c.symbol]: c.value }
                } else if (c.symbol === '$regex') {
                    //包含
                    condition[c.key] = { [c.symbol]: c.value, $options: 'is' }
                } else if (c.symbol === '$neRegex') {
                    //不包含
                    condition[c.key] = { $regex: '^((?!' + c.value + ').)*$', $options: 'is' }
                } else if (c.symbol === '$lRegex') {
                    //左包含
                    condition[c.key] = { $regex: '^(' + c.value + ')', $options: 'is' }
                } else if (c.symbol === '$rRegex') {
                    //右包含
                    condition[c.key] = { $regex: '(' + c.value + ')$', $options: 'is' }
                } else if (c.symbol === '$lNeRegex') {
                    //左不包含
                    condition[c.key] = { $regex: '^(?!' + c.value + ')', $options: 'is' }
                } else if (c.symbol === '$rNeRegex') {
                    //右不包含
                    condition[c.key] = { $regex: '(?<!' + c.value + ')$', $options: 'is' }
                } else {
                    condition[c.key] = { [c.symbol]: c.value }
                }
                if (child.length > 1) {
                    conditions.$and.push(condition)
                } else {
                    conditions = condition
                }
            }
            if (filter.length > 1) {
                filter.$or.push(conditions)
            } else {
                filter = conditions
            }
        }
        return filter
    }
    static uuid(){
        return uuid()
    }
}

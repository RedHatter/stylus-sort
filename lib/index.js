const fs = require('fs')
const readline = require('readline')

module.exports = class StylusSort {
  constructor (config) {
    let order = []
    try {
      order = require(config)
    } catch (e) {
      order = require(`../config/${config}.json`)
    }
    this.order = [].concat.apply([], order['sort-order'])
  }

  processPath (path, callback) {
    if (fs.statSync(path).isFile()) {
      this.processFile(path, callback)
    } else {
      let files = fs.readdirSync(path)
      var counter = 0
      files.forEach((file) => this.processFile(file, (err) => {
        if (++counter >= files.length) callback(err)
      }))
    }
  }

  processFile (file, callback) {
    let ast = new AST()
    let level = ast

    readline
      .createInterface({ input: fs.createReadStream(file) })
      .on('line', line => {
        level = level.push(line)
      })
      .on('close', () => {
        level.finish()
        ast.sort(this.order)
        fs.writeFile(file, ast.toString(), (err) => {
          if (callback) callback(err)
        })
      })
  }
}

class AST {
  constructor () {
    this.statments = []
  }

  push (line) {
    let indent = line.search(/\S/)

    if (indent < 1) {
      if (this.prvLine !== undefined) this.statments.push(this.prvLine)
      this.prvLine = line
      return this
    } else if (indent > 0) {
      let rule = new Rule(indent, this.prvLine, this)
      this.prvLine = ''
      rule.push(line)
      this.statments.push(rule)
      return rule
    }
  }

  sort (order) {
    this.statments.forEach((statment) => {
      if (typeof statment === 'object') statment.sort(order)
    })
  }

  toString () {
    let result = ''
    this.statments.forEach((statment) => {
      if (typeof statment === 'object') result += statment.toString()
      else result += statment + '\n'
    })

    return result
  }
}

class Rule {
  constructor (indent, selector, parent) {
    this.indent = indent
    this.selector = selector
    this.parent = parent

    this.properties = []
    this.rules = []
    this.prepend = ''
  }

  finish () {
    this.properties.push(this.prvLine)
    this.prvLine = null
  }

  push (line) {
    let indent = line.search(/\S/)
    if (indent === -1) {
      this.prepend = '\n'
      return this
    }

    if (indent === this.indent) {
      if (this.prvLine) this.properties.push(this.prvLine)
      this.prvLine = line
      return this
    } else if (indent > this.indent) {
      let rule = new Rule(indent, this.prepend + this.prvLine, this)
      this.prepend = ''
      this.prvLine = undefined
      rule.push(line)
      this.rules.push(rule)
      return rule
    } else if (indent < this.indent) {
      if (this.prvLine) this.properties.push(this.prvLine)
      this.parent.prepend = this.prepend
      this.prepend = ''
      return this.parent.push(line)
    }
  }

  sort (order) {
    this.rules.forEach((rule) => rule.sort(order))

    this.properties.sort((a, b) => {
      a = a.match(/^\s*(.+?)\s/)
      b = b.match(/^\s*(.+?)\s/)

      if (!a || !b) return 0

      a = a[1]
      b = b[1]

      for (let property of order) {
        if (property === a) return -1
        if (property === b) return 1
      }

      return 0
    })
  }

  toString () {
    let result = this.selector + '\n'
    this.properties.forEach(property => { result += property + '\n' })
    this.rules.forEach((rule) => { result += rule.toString() })

    return result
  }
}

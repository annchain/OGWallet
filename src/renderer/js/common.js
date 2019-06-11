const OG = require('og-sdk')
const bip39 = require('bip39')
const db = require('../db/db.js')
const CryptoJS = require('crypto-js')
const promise = require('bluebird')
const pdfMake = require('pdfmake/build/pdfmake.js')
const pdfFonts = require('pdfmake/build/vfs_fonts.js')
const abi = require('ethjs-abi')
const config = require('../config/config.js')
pdfMake.vfs = pdfFonts.pdfMake.vfs

var initurl = config.OG_RPC.HttpProvider

var og = new OG()

db.query('SELECT * from conn where id = 1').then((data) => {
  console.log(data.data[0].url)
  og.setProvider(
    new OG.providers.HttpProvider(data.data[0].url)
  )
}).then().catch((e) => {
  og.setProvider(
    new OG.providers.HttpProvider(initurl)
  )
})

// og.setProvider(
//   new OG.providers.HttpProvider(config.OG_RPC.HttpProvider)
// )

db.query('SELECT * from txHistory where cStatus == "pending"').then((data) => {
  console.log(data)
  for (var i = 0; i < data.data.length; i++) {
    checkTxStatus(data.data[i].txHash)
  }
})

db.query('SELECT * from txHistory where cStatus == "failed"').then((data) => {
  console.log(data)
  for (var i = 0; i < data.data.length; i++) {
    checkTxStatus(data.data[i].txHash)
  }
})

var checkTxStatus = function (txHash) {
  console.log(txHash)
  og.confirm(txHash).then((data) => {
    console.log(txHash, data)
    if (typeof data.data === 'boolean') {
      if (data.data) {
        var status = 'success'
      } else {
        // eslint-disable-next-line no-redeclare
        var status = 'failed'
      }
    } else {
      // eslint-disable-next-line no-redeclare
      var status = data.message // do not use true or false expect use success or failed
    }
    var sql = 'UPDATE txHistory SET cStatus = "' + status + '" where txHash = ' + '"' + txHash + '"'
    console.log(sql)
    db.execute(sql)
  })
}

var C = {}

C.getExeAcc = function () {
  return og.newAccount()
}

C.changeConn = function (url) {
  console.log(url)
  var sql = 'UPDATE conn Set url ="' + url + '" where id = 1'
  return db.execute(sql)
}

C.getNetInfo = function () {
  // eslint-disable-next-line new-cap
  return new promise(function (resolve, reject) {
    og.net_info().then((data) => {
      console.log(data)
      if (data.data) {
        resolve(data)
      // eslint-disable-next-line no-undef
      }
    }).then().catch((err) => {
      reject(err)
    })
  })
}

C.getMonitor = function () {
  // eslint-disable-next-line new-cap
  return new promise(function (resolve, reject) {
    og.monitor().then((data) => {
      // console.log(data)
      if (data.data) {
        resolve(data)
      // eslint-disable-next-line no-undef
      }
    }).then().catch((err) => {
      reject(err)
    })
  })
}

C.getReceipt = function (hash) {
  return og.getReceipt(hash)
}

C.getPeer = function () {
  return og.peers_info()
}

C.createAccount = function () {
  return og.newAccount()
}

C.getSeq = function (num) {
  return og.sequencerInfo(num)
}

C.getSeqByHash = function (hash) {
  return og.sequencerInfoByHash(hash)
}

C.getSeqTxNum = function (num) {
  return og.sequencer_confirm_tx(num)
}

C.getConfirmStatus = function () {
  return og.confirm_status()
}

C.getTransaction = function (hash) {
  return og.getTransaction(hash)
}

C.net_io = function () {
  return og.net_io()
}

C.getTransactionByAddress = function (address) {
  return og.getTransactionByAddress(address)
}

C.queryContract = function (address, data) {
  var form = {
    'address': address,
    'data': data
  }
  return og.queryContract(form)
}

C.createAccount_useBip39 = function () {
  var mnemonic = bip39.generateMnemonic()
  var entropy = bip39.mnemonicToEntropy(mnemonic)
  var privateKey = entropy + entropy
  var newAccount = og.recoveryAccount(privateKey)
  newAccount.recoverPhrase = mnemonic
  return newAccount
}

C.checkTxStatus = function () {
  db.query('SELECT * from txHistory where cStatus == "pending"').then((data) => {
    console.log(data)
    for (var i = 0; i < data.data.length; i++) {
      checkTxStatus(data.data[i].txHash)
    }
  })
  db.query('SELECT * from txHistory where cStatus == "failed"').then((data) => {
    console.log(data)
    for (var i = 0; i < data.data.length; i++) {
      checkTxStatus(data.data[i].txHash)
    }
  })
}

C.getBalance = function (addr) {
  return og.getBalance(addr)
}

C.getRecoverPhrase = function (data) {
  console.log(bip39.entropyToMnemonic(data))
  return bip39.entropyToMnemonic(data) // 24
}

C.generateRecoverPhase = function () {
  return bip39.generateMnemonic() // 12
}

C.recoverPrivate = function (data) {
  return bip39.mnemonicToEntropy(data)
}

C.recoveryAccount = function (privateKey) {
  return og.recoveryAccount(privateKey)
}

C.accountStorage = function (newAccount, newAccountOBJ) {
  return db.execute('INSERT INTO usr VALUES (?,?,?,?,?,?,?)', [newAccount.account_name, newAccount.account_hint, newAccountOBJ.address, newAccountOBJ.public, newAccountOBJ.public_raw, newAccountOBJ.privateKey, newAccount.balance])
}

C.deleteAccount = function (address) {
  return db.execute('DELETE FROM usr WHERE address == "' + address + '"')
}

C.deleteContract = function (address) {
  return db.execute('DELETE FROM contract WHERE address == "' + address + '"')
}

C.getNonce = function (address) {
  return og.getNonce(address)
}

C.sendTransaction = function (tx) {
  return og.sendTransaction(tx)
}

C.checkAddress = function (address) {
  console.log(address)
  var checkPoint = '0x'
  if (address.slice(0, 2) === checkPoint && address.length === 42) {
    return true
  } else {
    return false
  }
}

C.encryptPrivKey = function (password, decpri) {
  // password = password || 'abcdefg'
  // var key = CryptoJS.enc.Utf8.parse(password)
  // var srcs = CryptoJS.enc.Utf8.parse(decpri)
  // var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7})
  var a = CryptoJS.AES.encrypt(decpri, password, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7})
  return a.toString()
}

C.decryptPrivKey = function (password, encpri) {
  // var key = CryptoJS.enc.Utf8.parse(password)
  // var decrypt = CryptoJS.AES.decrypt(encpri, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7})
  var decpri = CryptoJS.AES.decrypt(encpri, password, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8)
  return decpri
}

C.saveTransaction = function (tx, hash) {
  // var time = new Date().toString()
  var timestamp = Date.parse(new Date())
  var newDate = new Date()
  newDate.setTime(timestamp)
  var time = newDate.toLocaleString('chinese', { hour12: false })
  return db.execute('INSERT INTO txHistory VALUES (?,?,?,?,?,?)', [hash, tx.status, tx.from, tx.to, tx.amount, time])
}

C.saveContract = function (txhash, address, name, abi) {
  var timestamp = Date.parse(new Date())
  var newDate = new Date()
  newDate.setTime(timestamp)
  var time = newDate.toLocaleString('chinese', { hour12: false })
  return db.execute('INSERT INTO contract VALUES (?,?,?,?,?)', [txhash, address, name, abi, time])
}

C.getTxParams = function (cfrom, cto, cvalue, cpublicKey, cpublicKeyRaw, cnonce, cdata) {
  var tx = {
    from: cfrom,
    to: cto,
    value: cvalue,
    publicKey: cpublicKey,
    publicKey_raw: cpublicKeyRaw,
    height: 10,
    nonce: cnonce,
    data: cdata || ''
  }
  return tx
}

C.genRawTransaction = function (txParams) {
  return og.genRawTransaction(txParams)
}

C.signRawTransaction = function (signTarget, privateKey) {
  return og.signRawTransaction(signTarget, privateKey).signature
}

C.makeUpTransaction = function (txParams, signature) {
  return og.makeUpTransaction(txParams, signature)
}

C.randArr = function (arr) {
  var len = arr.length
  for (var i = len - 1; i >= 0; i--) {
    var randomIndex = Math.floor(Math.random() * (i + 1))
    var itemIndex = arr[randomIndex]
    arr[randomIndex] = arr[i]
    arr[i] = itemIndex
  }
  return arr
}

C.layoutPDF = function (data) {
  var docDefinition = {
    content: [
      // { text: 'OG ACCOUNT BACKUP CARD', style: 'header', absolutePosition: { x: 225, y: 50 } }, '\n', '\n',
      { text: 'OG ACCOUNT BACKUP CARD', style: 'header' }, '\n', '\n',
      { text: 'OG account:', style: 'header' },
      data.name, '\n',
      { text: 'address:', style: 'header' },
      data.address, '\n',
      { qr: data.address }, '\n',
      // { text: 'privKey:', style: 'header' },
      // data.secp_privKey, '\n',
      { text: 'recoverPhrase:', style: 'header' },
      data.recoverPhrase, '\n'
    ]
  }
  // eslint-disable-next-line new-cap
  return new promise(function (resolve, reject) {
    try {
      pdfMake.createPdf(docDefinition).download()
      resolve('success')
    } catch (err) {
      reject(err)
    }
  })
}

C.filterGetFun = function (abiArr) {
  // eslint-disable-next-line no-array-constructor
  var result = new Array()
  for (var i = 0; i < abiArr.length; i++) {
    var item = abiArr[i]
    console.log(item)
    console.log(item.type)
    if (item.type === 'function' && item.stateMutability === 'view') {
      result.push(item)
    }
  }

  return result
}

C.filterSetFun = function (abiArr) {
  // eslint-disable-next-line no-array-constructor
  var result = new Array()
  for (var i = 0; i < abiArr.length; i++) {
    var item = abiArr[i]
    if (item.type === 'function' && item.stateMutability === 'nonpayable') {
      result.push(item)
    }
  }

  return result
}

C.filterConstFun = function (abiArr) {
  // eslint-disable-next-line no-array-constructor
  var result = new Array()
  for (var i = 0; i < abiArr.length; i++) {
    var item = abiArr[i]
    if (item.type === 'constructor') {
      result.push(item)
    }
  }

  return result
}

C.toJSON = function (str) {
  // eslint-disable-next-line no-eval
  return eval('(' + str + ')')
}

// @param {array} _interface
// @param {array} _inputs
C.encodeMethod = function (_interface, _inputs) {
  return abi.encodeMethod(_interface, _inputs)
}

C.decodeMethod = function (_interface, _outputs) {
  return abi.decodeMethod(_interface, _outputs)
}

module.exports = C

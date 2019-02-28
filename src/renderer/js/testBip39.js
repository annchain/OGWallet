var bip = require('bip39')
var OG = require('og-sdk')

var og = new OG()

var aa = bip.generateMnemonic() // 12

console.log(aa)

var bb = bip.mnemonicToEntropy(aa)

console.log(bb)

var cc = 'trial retire wild alarm sail quiz special oyster deposit behind joy match enact begin all wise tunnel text virus hazard office mass speak cream'

var dd = bip.mnemonicToEntropy(cc)

console.log(dd)

var ff = bip.mnemonicToEntropy(aa)

console.log(ff)

var gg = bb + bb

console.log(gg)

var hh = og.recoveryAccount(gg)

console.log(hh)

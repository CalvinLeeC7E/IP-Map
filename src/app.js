const datx = require('ipip-datx') // 引入ipip-datx模块
var ips = require('./ips')
var IpTools = new datx.City("/Users/calvinlee/Desktop/ip-test/17monipdb.datx")
// findSync 此方法只接受IPv4类型的IP地址，请自行检查参数是否符合规定；
let cityCount = {}
ips.forEach(item => {
  let locations = IpTools.findSync(item)
  let city = locations[2] || null
  if (city === null) return
  if (city in cityCount) {
    cityCount[city] += 1
  } else {
    cityCount[city] = 1
  }
})
console.log(cityCount)

// var district = new datx.District("../17monipdb.datx");
// // findSync 此方法只接受IPv4类型的IP地址，请自行检查参数是否符合规定；
// console.log(district.findSync("123.121.17.72"));
// http://socket.fe.i200.cn/listIps
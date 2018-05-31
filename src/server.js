var server = require('http').createServer()
const axios = require('axios')
const datx = require('ipip-datx') // 引入ipip-datx模块
const path = require('path')
var IpTools = new datx.City(path.join(__dirname, '../17monipdb.datx'))
server.on('request', async (req, res) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
  }
  if (req.url === '/mapData') {
    try {
      let response = await axios.get('http://socket.fe.i200.cn/listIps')
      let ipCountMap = response.data || {}
      let ips = Object.keys(ipCountMap)
      console.log(Object.values(ipCountMap).reduce((res, item) => res += item, 0))
      // findSync 此方法只接受IPv4类型的IP地址，请自行检查参数是否符合规定；
      let cityCount = {}
      ips.forEach(ipAddress => {
        let locations = IpTools.findSync(ipAddress)
        let city = locations[2] || null
        if (city === null) return
        if (city in cityCount) {
          cityCount[city] += ipCountMap[ipAddress]
        } else {
          cityCount[city] = ipCountMap[ipAddress]
        }
      })
      res.writeHead(200, headers)
      res.write(JSON.stringify(cityCount))
      res.end()
    } catch (e) {
      console.log(e)
      res.writeHead(200, headers)
      res.write(JSON.stringify({}))
      res.end()
    }
  }
})
server.listen(process.env.PORT || 3002)
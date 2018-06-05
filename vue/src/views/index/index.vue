<template>
  <div class="main-view">
    <div id="chart-panel"></div>
    <p class="data-info">
      关于数据<br>
      地图所有点均为真实数据，地理信息由IP推出
    </p>
    <el-row style="z-index: 10">
      <el-col :span="4">
        <div class="total">
          <div class="total--title">当前在线:</div>
          <div>{{total | stdNumber}}</div>
        </div>
        <div class="top10">
          <div class="top10--title">Top 10：</div>
          <div class="top10--item" v-for="item in top10">
            <div class="top10-item-title">{{item[0]}}</div>
            <div>{{item[1] | stdNumber}}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="16"></el-col>
      <el-col :span="4"></el-col>
    </el-row>
  </div>
</template>

<script>
  import Vue from 'vue'
  import axios from 'axios'

  Vue.filter('stdNumber', function (val) {
    function chunk (arr, size) {
      let res = []
      for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size))
      }
      return res
    }

    if (Number.isNaN(val)) return ''
    const size = 3
    var res = ['', '']
    val = val.toString()
    let vals = val.split('.')
    res[0] = chunk(vals[0].split('').reverse(), size).map(function (item) {
      return item.reverse()
    }).map(function (item) {
      return item.join('')
    }).reverse().join(',')
    if (vals[1]) res[1] = vals[1].padEnd(2, '0')
    return res.join('')
  })

  export default {
    name: 'MainView',
    data () {
      return {
        total: '',
        top10: [],
        myChart: null,
        geoCoordMap: {}
      }
    },
    mounted () {
      this.myChart = echarts.init(document.getElementById('chart-panel'))
      window.onresize = () => {
        this.myChart.resize()
      }
      this.loadGeoMapData().then(() => {
        this.init()
      })
    },
    methods: {
      showTotal (val) {
        this.total = val
      },
      loadGeoMapData () {
        return axios.get('http://cloud.fe.i200.cn/cloud/5a8f75b1854bfb7912357db4/calvin/echarts/map/chinaCity').then((res) => {
          this.geoCoordMap = res.data
        })
      },
      init () {
        axios.get('http://ipmap.fe.i200.cn/mapData').then(res => {
          this.render(res.data)
          setTimeout(() => {
            this.init()
          }, 30 * 1000)
        })
      },
      render (myData) {
        function float2 (val, fixed) {
          if (!fixed) fixed = 2
          return Number(Number(val).toFixed(fixed))
        }

        function converMyData () {
          let ips = Object.keys(myData).map(key => [key, myData[key]])
          ips.sort((a, b) => b[1] - a[1])

          let sum = ips.reduce((res, item) => res += item[1], 0)

          let avg = float2(sum / ips.length)

          for (let item of ips) {
            item[2] = float2(item[1] / avg) + 1
          }
          return {ips, sum}
        }

        const mapConver = (citys) => {
          var res = []
          var colors = ['#67C23A', '#409EFF', '#E6A23C']
          let cityCount = citys.length
          for (let i = 0; i < cityCount; i++) {
            let cityItem = citys[i]
            let cityName = cityItem[0].replace('市', '')
            let cityValueAfterAvg = cityItem[2]
            let xy = this.geoCoordMap[cityName]
            if (!xy) {
              continue
            }
            let colorIndex = Math.floor(i / float2(cityCount / colors.length, 0))
            res.push({
              "name": cityName,
              "value": xy,
              "symbolSize": cityValueAfterAvg,
              "itemStyle": {"normal": {"color": `${colors[colorIndex]}`}}
            })
          }
          return res
        }

        let convertData = converMyData()
        let mapDataArr = convertData.ips
        this.top10 = convertData.ips.slice(0, 10)
        this.showTotal(convertData.sum)

        var allData = {
          citys: mapConver(mapDataArr)
        }

        var option = {
          backgroundColor: '#404a59',
          title: {
            text: '实 时 在 线',
            left: 'center',
            textStyle: {
              color: '#fff'
            }
          },
          legend: {
            show: false,
            orient: 'vertical',
            top: 'bottom',
            left: 'right',
            data: ['地点', '线路'],
            textStyle: {
              color: '#fff'
            }
          },
          geo: {
            map: 'china',
            label: {
              emphasis: {
                show: false
              }
            },
            roam: false,
            itemStyle: {
              normal: {
                areaColor: '#323c48',
                borderColor: '#404a59'
              },
              emphasis: {
                areaColor: '#2a333d'
              }
            }
          },
          series: [{
            name: '地点',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                show: true,
                position: 'right',
                formatter: '{b}'
              }
            },
            hoverAnimation: true,
            showEffectOn: 'render',
            itemStyle: {
              normal: {
                color: '#46bee9'
              }
            },
            data: allData.citys.slice(0, 10)
          }, {
            name: '地点',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              emphasis: {
                show: true,
                position: 'right',
                formatter: '{b}'
              }
            },
            hoverAnimation: true,
            showEffectOn: 'render',
            itemStyle: {
              normal: {
                color: '#46bee9'
              }
            },
            data: allData.citys.slice(10)
          }]
        };
        this.myChart.setOption(option);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .main-view {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    padding: 20px;
    background: #404a59;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  #chart-panel {
    position: absolute;
    left: 0;
    right: 0;
    top: 20px;
    bottom: 0;
  }
  
  .total {
    color: white;
    font-size: 20px;
    display: flex;
    flex-direction: row;
  }
  
  .total .total--title {
    flex: 1;
  }
  
  .top10 {
    margin-top: 20px;
    color: white;
    font-size: 16px;
  }
  
  .top10 .top10--title {
    padding: 10px 0;
    font-size: 20px;
  }
  
  .top10--item {
    display: flex;
    flex-direction: row;
  }
  
  .top10--item .top10-item-title {
    flex: 1;
  }
  
  .data-info {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: scale(0.6);
    color: white;
  }
</style>

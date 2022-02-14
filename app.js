const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');

//用於撈取data資料
function getData(file, type) {
    let data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            });
    });
  }

  // 定義輸出後的csv欄位, 附上時間戳記
const dateTime = Date.now();
const timestamp = Math.floor(dateTime / 1000);
console.log(timestamp)
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'output/output'+timestamp+'.csv',
  header: [
    {id: 'userAddress', title: '使用者地址'},
    {id: 'storeAddress', title: '店家地址'},
    {id: 'userAddress_standardization', title: '使用者地址(正規化後)'},
    {id: 'time', title: 'GoogleMap 外送時間'},
    {id: 'distance_google', title: 'GoogleMap 外送距離'},
    {id: 'map8_user_position', title: '使用者Map8座標'},
    {id: 'map8_level', title: 'Map8 Level'},
    {id: 'auth', title: 'Map8 地址門牌資料庫'},
    {id: 'distancn_map8_before', title: 'Map8 外送距離'},
    {id: 'distance_map8', title: 'Map8 外送距離(正規化後)'},
    {id: 'distance_google_map8_before', title: 'Google Map 與 Map8外送距離差距'},
    {id: 'distance_google_map8', title: 'Google Map 與 Map8外送距離差距(正規化後)'},
    {id: 'statusCode', title: '狀態碼'}
  ]
});

//丟入指定檔名即可使用
async function analysis_map8(csvFile) {
    try {
        let writeData = [] 
        const data = await getData(csvFile, {});
        for(const [index, element] of data.entries()) {
          let = value = {}
          try {
            //取得csv欄位資料
            const userAddress = element.userAddress
            const storeAddress = element.storeAddress
            const distance_google = element.Distance
            const time_google = element.Time
            // 正規化使用者地址
            const standardization_data_user = await axios.get(encodeURI('https://api.map8.zone/v2/address/standardization?query='+userAddress+'&key='key'))
            if  (standardization_data_user.data.status === 'OK') {
              const standardization_userAddress_address = standardization_data_user.data.results[0].formatted_address
              //正規化前的地址做geocode
              const content_before = await axios.get(encodeURI('http://api.map8.zone/distancematrix/foot/json?key='key'&origins='+storeAddress+'&destinations='+userAddress+'&language=zh_TW'))
              //正規化後的地址做geocode
              const content = await axios.get(encodeURI('http://api.map8.zone/distancematrix/foot/json?key='key'&origins='+storeAddress+'&destinations='+standardization_userAddress_address+'&language=zh_TW'))
              //賦值
              value = {
                  userAddress: userAddress,
                  storeAddress: storeAddress,
                  userAddress_standardization: standardization_userAddress_address,
                  time: time_google,
                  distance_google: distance_google,
                  map8_user_position: content.data.destinations[0].routePoint.location[0]+', '+content.data.destinations[0].routePoint.location[1],
                  map8_level: content_before.data.destinations[0].place.level,
                  auth: content_before.data.destinations[0].place.authoritative,
                  distancn_map8_before: content_before.data.rows[0].elements[0].distance.value,
                  distance_map8: content.data.rows[0].elements[0].distance.value,
                  distance_google_map8_before: Number(distance_google) - Number(content_before.data.rows[0].elements[0].distance.value),
                  distance_google_map8: Number(distance_google) - Number(content.data.rows[0].elements[0].distance.value),
                  statusCode: standardization_data_user.data.results[0].resultAnalysis.statusCode
              }
            }
            else {
              value = {
                userAddress: userAddress,
                storeAddress: storeAddress,
                time: time_google,
                distance_google: distance_google,
                statusCode: standardization_data_user.data.queryQuality.statusCode
              }
            }
            //寫入資料
            writeData.push(value)
          }
          catch (error) {
            console.error("forLoop data ", error.message + element);
          }
        }
        //輸出csv
        csvWriter
        .writeRecords(writeData)
        .then(()=> console.log('The CSV file was written successfully'));
    } catch (error) {
        console.error("testGetData: An error occurred: ", error.message);
    }
  }
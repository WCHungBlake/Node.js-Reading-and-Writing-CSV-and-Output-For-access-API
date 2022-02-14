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
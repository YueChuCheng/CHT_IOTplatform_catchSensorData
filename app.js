//Yue Chu Cheng 2020/2/27
//Email:maggie9907@gmail.com
//Usage:
//  To catch every sensor's data in project, export to .csv file

//Reference:
//  *install node js to your computer 
//  *type "npm i" on your terminal to download node_modules
//  type "node app.js" to run the script
//  import .csv file to set sensor ,device ,expression has stable format , refer addDeviceSensor.csv, addSensor.csv, expression.csv
//  type "pkg -t node10-win-x64 app.js" to convert .js to .exe(windows)

//  Package used:
//      request : https://www.npmjs.com/package/request
//      events : https://www.npmjs.com/package/events
//      pkg : https://www.npmjs.com/package/pkg
//      fs : https://www.npmjs.com/package/fs
//      chalk : https://www.npmjs.com/package/chalk
//      clear : https://www.npmjs.com/package/clear
//      inquirer : https://www.npmjs.com/package/inquirer

//command line GUI
const clear = require('clear'); //clears the terminal screen
require('events').EventEmitter.defaultMaxListeners = 0;
const inquirer = require('inquirer');//creates interactive command-line user interface
const chalk = require('chalk');//colorizes the output
//use HTTP
const FileSystem = require("fs");
var request = require('request');
var newLine = '\n';
var KEY = '';//CK

//select data need to turn to csv
var LAT = true;
var LON = true;
var VALUE = true;
const DATANUM = LAT + LON + VALUE + 1; //'+1' for TIME's column  

const inquire = {
  askProjectKEY: () => {
    const questions = [
      {
        name: 'KEY',
        type: 'input',
        message: 'Your project key:',
        validate: async function (value) {
          //get API status
          project_string = await request_project_GET(value);
          project_JSON = JSON.parse(project_string);

          if (project_JSON.status) //if API key not exist API key print status
            return chalk.red(project_JSON.status);
          else
            return true;

        }
      }
    ]
    return inquirer.prompt(questions);
  },
  askStartTime: () => {
    const questions = [
      {
        name: 'time',
        type: 'input',
        message: 'Start Time:',
        validate: async function (value) {
          if (value) //if API key not exist API key print status
            return true;
          else
            return chalk.red(project_JSON.status);

        }
      }
    ]
    return inquirer.prompt(questions);
  },
  askEndTime: () => {
    const questions = [
      {
        name: 'time',
        type: 'input',
        message: 'End Time:',
        validate: async function (value) {
          if (value) //if API key not exist API key print status
            return true;
          else
            return chalk.red(project_JSON.status);

        }
      }
    ]
    return inquirer.prompt(questions);
  }
}

let request_project_GET = function (key) {

  return new Promise((resolve, reject) => {
    var projectOption_GET = {
      method: 'GET',
      url: 'https://iot.cht.com.tw/iot/v1/device',
      headers:
      {
        'content-type': 'text/plain',
        'CK': key,

      },

    };
    request(projectOption_GET, (error, response, body) => {
      if (error)
        console.log(error);
      resolve(body);

    });

  });
};

//set options_sensor
function setOPT_sensor(deviceID, key) {
  var options_device = {
    method: 'GET',
    url: 'https://iot.cht.com.tw/iot/v1/device/' + deviceID + '/sensor',
    headers:
    {
      'content-type': 'text/plain',
      'CK': key,

    },

  };
  return options_device;
}


//set options_sensorData
function setOPT_sensorData(deviceID, sensorID, key, startTime , endTime) {
  var options_sensorData = {
    method: 'GET',
    url: 'https://iot.cht.com.tw/iot/v1/device/' + deviceID + '/sensor/' + sensorID + '/rawdata?start=' + startTime + '&end=' + endTime,
    headers:
    {
      'content-type': 'text/plain',
      'CK': key,

    },

  };
  return options_sensorData;
}



//get deviceID Promise
let request_deviceID = function (key) {
  var options_device = {
    method: 'GET',
    url: 'https://iot.cht.com.tw/iot/v1/device',
    headers:
    {
      'content-type': 'text/plain',
      'CK': key,

    },

  };
  return new Promise((resolve, reject) => {

    request(options_device, (error, response, body) => {
      var deviceID = [];
      //get all deviceID 
      JSON.parse(body, function (key, value) {
        if (key == "id")
          deviceID.push(value);
      });
      resolve(deviceID);
    });

  });
};


//get sensorID Promise
let request_sensorID = function (deviceID, key) {
  var sensorID = [];
  return new Promise((resolve, reject) => {
    var option_sensor = setOPT_sensor(deviceID, key);
    request(option_sensor, (error, response, body) => {
      JSON.parse(body, function (key, value) {
        if (key == "id")
          sensorID.push(value);
      })
      resolve(sensorID);
    })

  });
};


//get all sensor JSON
let request_sensorData = function (deviceID, sensorID, key , startTime , endTime) {
  //var sensorValue;
  return new Promise((resolve, reject) => {

    var option_sensorData = setOPT_sensorData(deviceID, sensorID, key, startTime , endTime);
    request(option_sensorData, (error, response, body) => {
      resolve(body);
    })

  });

};



//change Array to CSVs
function ArrayToCSV(sensorNameArray, sensorDataArray, sensorName) {
  var dataMAX = 0; //最大數據量
  var csv = [];
  //var universalBOM = "\uFEFF"; //add BOM so that EXCEL will Read data as UTF-8 from
  var universalBOM = "";

  //set sensor title
  for (let sensorNUM = 0; sensorNUM < sensorNameArray.length; sensorNUM++) {

    if (sensorNUM == 0)
      csv.push(universalBOM + sensorNameArray[sensorNUM]);

    else
      csv.push(sensorNameArray[sensorNUM]);

    for (let dataNUM = 0; dataNUM < DATANUM; dataNUM++) {
      csv.push("");
    }



  }

  //set data title

  for (let sensorNUM = 0; sensorNUM < sensorNameArray.length; sensorNUM++) {
    if (sensorNUM == 0)
      csv.push(newLine + "Time");
    else
      csv.push("Time");

    if (VALUE)
      csv.push("Value");

    if (LON)
      csv.push("Lon");

    if (LAT)
      csv.push("Lat");

    csv.push(""); // space between every sensor's data 
  }

  //find out the maximum number of all sensor's data, avoiding plate shifting
  for (let sensorNUM = 0; sensorNUM < sensorNameArray.length; sensorNUM++) { //sensor quantity
    if (sensorDataArray[sensorNUM].length > dataMAX)
      dataMAX = sensorDataArray[sensorNUM].length;
  }

  //set data
  for (let dataNUM = 0; dataNUM < dataMAX / DATANUM; dataNUM++) {
    for (let sensorNUM = 0; sensorNUM < sensorNameArray.length; sensorNUM++) {//sensor quantity
      if (sensorDataArray[sensorNUM][DATANUM * dataNUM] == null) { //if sensor has no data
        if (sensorNUM == 0)
          csv.push(newLine + "");
        else
          csv.push("");
        for (let i = 0; i < DATANUM; i++) { //有幾筆資料push 幾次
          csv.push("");
        }
      }
      else {

        if (sensorNUM == 0)
          csv.push(newLine + sensorDataArray[sensorNUM][DATANUM * dataNUM]);
        else
          csv.push(sensorDataArray[sensorNUM][DATANUM * dataNUM]);

        for (let i = 1; i < DATANUM; i++) { //有幾筆資料push 幾次
          csv.push(sensorDataArray[sensorNUM][DATANUM * dataNUM + i]);
        }
        csv.push(""); // space between every sensor's data 
      }

    }
  }

  //FileSystem.writeFileSync("sensorData" + sensorName + ".csv", csv); //create file.csv
  FileSystem.writeFile("sensorData" + sensorName + ".csv", csv, { encoding: 'utf8' }, function (err) {
    if (err)
      console.log(err);
    else
      console.log('Write operation complete.');
  });

}



(async () => {


  var deviceID = [];
  var sensorID = [];
  //get project key
  KEY = await inquire.askProjectKEY();
  KEY = KEY.KEY;

  //get time
  //startTime = "2020-02-13T07:18:02"; //data start time
  //endTime = "2020-02-14T07:18:02";//data end time
  var startTime = await inquire.askStartTime();
  var endTime = await inquire.askEndTime();

  startTime = startTime.time;
  endTime = endTime.time;
  //get all deviceID
  deviceID = await request_deviceID(KEY);

  //get all sensorID
  for (let deviceNUM = 0; deviceNUM < deviceID.length; deviceNUM++) {
    sensorID.push(await request_sensorID(deviceID[deviceNUM], KEY));
  }



  //get data
  for (let deviceNUM = 0; deviceNUM < deviceID.length; deviceNUM++) {
    var testJSON = [];
    var testString;
    var finalData = [];
    for (let sensorNUM = 0; sensorNUM < sensorID[deviceNUM].length; sensorNUM++) {
      testJSON.push(await request_sensorData(deviceID[deviceNUM], sensorID[deviceNUM][sensorNUM], KEY , startTime , endTime));
      for (let x = 0; x < testJSON.length; x++) { //所有 sensor 資料
        testString = testJSON[x];
        testString = testString.match(/\{(.*?)\}/g);
        var data = [];
        if (testString) {
          for (let JsonNUM = 0; JsonNUM < testString.length; JsonNUM++) {

            //modify time
            var time = JSON.parse(testString[JsonNUM]).time;
            var time = time.substr(0, 19);
            var originalTime = 'T' + time.substr(11, 2);
            var modifyHour = Number(time.substr(11, 2)) + 8;
            if (modifyHour >= 24)
              modifyHour -= 24;
            modifyHour = 'T' + String(modifyHour);
            time = time.replace(originalTime, modifyHour);
            data.push(time);

            //modify value
            if (VALUE) {
              var value = String(JSON.parse(testString[JsonNUM]).value !== undefined ? JSON.parse(testString[JsonNUM]).value : '');
              data.push(value);
            }

            //modify lon
            if (LON)
              data.push(JSON.parse(testString[JsonNUM]).lon !== undefined ? JSON.parse(testString[JsonNUM]).lon : '');


            //modify lat
            if (LAT)
              data.push(JSON.parse(testString[JsonNUM]).lat !== undefined ? JSON.parse(testString[JsonNUM]).lat : '');

          }
        }


      }

      finalData.push(data);
    }
    ArrayToCSV(sensorID[deviceNUM], finalData, deviceID[deviceNUM]);
  }

})();


//node app.js



statusCtrl=new StatusControl("statusX");

function onEdit(e){
  //https://coporilife.com/392/
  const sheetName = e.source.getSheetName();
  //編集されたシート名と対象にしたいシート名が一致したら実行
  if(sheetName === 'シート1'){
    //編集されたセルの行数を取得
    const row = e.range.getRow();
    //編集されたセルの列数を取得
    const col = e.range.getColumn();

    if(row === 1 && col === 1){
      /**
       * A1セルに変更があったらその値をstatusに反映する
       * statusCtrlやLongPollingをテストする目的の機能
       */
      const sheet = e.source.getActiveSheet();
      const valCell=sheet.getRange(1,1);
      const contStatus=Number(valCell.getValue());
      Logger.log(contStatus);
      statusCtrl.updateStatus({"cont":contStatus});
    }
  }
}

//認証方法 -> 時間がたつとOAuthTokenが変わるのでこの方法は不完全？
//https://www.ka-net.org/blog/?p=12258
//CORSのエラー
//https://stackoverflow.com/questions/53433938/how-do-i-allow-a-cors-requests-in-my-google-script
//https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q13276711733

function doGet(e) {
  const type=e.parameter.type;
  Logger.log("detect get");
  switch(type){
    /**
     * ウェブアプリのhtmlを返す
     * response ウェブアプリのhtml
     */
    default:
    case undefined:
    return HtmlService.createTemplateFromFile('index').evaluate();
  }
}

function doPost(e) {
  const type=e.parameter.type;
  Logger.log("detect post");
  Logger.log(`request type: ${type}`);
  switch(type){
    /**
     * Long Pollingを行う
     * postData {
     *  timeout_ms:タイムアウトするまでの時間,
     *  version:post元が所有するstatusのversion
     * }
     * response {
     *  ret:"change"|"timeout",
     *  status:現行のstatus
     * }
     */
    case "polling":{
      const postJson=JSON.parse(e.postData.getDataAsString());
      const watcher=statusCtrl.genWatcher(postJson.version);
      const timeoutTime=Date.now()+postJson.timeout;
      Logger.log(`receive postJson:${postJson}`);
      Logger.log(`request timeout:${postJson.timeout} version:${postJson.version}`);
      let retPayload=null;
      while (true){
        if(watcher.isChanged){
          retPayload={"ret":"change","status":statusCtrl.status};
          break;
        }else if((Date.now())>timeoutTime){
          retPayload={"ret":"timeout","status":statusCtrl.status};
          break;
        }
        Utilities.sleep(250);
      }
      const ret=ContentService.createTextOutput();
      ret.setContent(JSON.stringify(retPayload));
      ret.setMimeType(ContentService.MimeType.JSON);
      return ret;
    }
    /** 
     * statusのupdateを行う
     * postData statusの差分
     * response 現行のstatus
     */
    case "updateStatus":{
      const jsonString = e.postData.getDataAsString();
      const data = JSON.parse(jsonString);
      Logger.log(data);
      statusCtrl.updateStatus(data);
      const ret=ContentService.createTextOutput();
      ret.setContent(JSON.stringify(statusCtrl.status));
      ret.setMimeType(ContentService.MimeType.JSON);
      return ret;
    }
    /**
     * 温湿度計のSHT30のデータがpostされる
     * statusの変更と、スプレッドシートへの書き込みを行う
     * postData {
     *  time: 温湿度が計測されたUNIX時間,
     *  temp: 温度,
     *  humidity: 湿度
     * }
     */
    case "postSHT30":{
      const jsonString = e.postData.getDataAsString();
      const data = JSON.parse(jsonString);
      Logger.log(data);
      statusCtrl.updateStatus(data);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("SHT30");
      sheet.appendRow([(new Date(data.time)).toString(),data.temp,data.humidity]);
      return;
    }
  }
  
}

function myFunction() {
  // Logger.log(DriveApp.getRootFolder().getName());
  Logger.log(ScriptApp.getOAuthToken());
  // setJsonProperty("status",{"ver":1});
}
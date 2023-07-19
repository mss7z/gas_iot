/**
 * JsonPropertyはGASのPropertiesServiceをクラスにまとめたものです。
 * 情報の読み書きをObjectで行い、内部でJSONに変換して文字列にしてPropertiesServiceに保存します。
 * PropertiesServiceのドキュメント
 * https://developers.google.com/apps-script/reference/properties/properties-service?hl=ja
 */
class JsonProperty{
  constructor(keyName){
    this._keyName=keyName;
    this._proberty=PropertiesService.getScriptProperties();
  }
  get isExistData(){
    return null!=this.rawDataStr;
  }
  set rawDataStr(val){
    // Logger.log(`hello called rawDataStr strval:${val}`);
    this._proberty.setProperty(this._keyName,val);
  }
  get rawDataStr(){
    Logger.log(`JsonProperty rawDataStr called warning`);
    return this._proberty.getProperty(this._keyName);
  }
  set data(val){
    this.rawDataStr=JSON.stringify(val);
    // Logger.log(`after data rawDataStr:${this.rawDataStr} val:${val["hel"]}`);
  }
  get data(){
    return JSON.parse(this.rawDataStr); 
  }
};

function testJsonProperty(){
  const jp=new JsonProperty("testJsonProperty");
  Logger.log(`isExistData :${jp.isExistData}`);
  jp.data={"hel":"pro"};
  Logger.log(`append data`);
  Logger.log(`isExistData :${jp.isExistData}`);
  Logger.log(`rawdataStr :${jp.rawDataStr}`);
  Logger.log(`data[hel] :${jp.data["hel"]}`);
}

/**
 * JsonPropertyCacheはJsonPropertyにCache機能を追加したものです。
 * PropertiesServiceは読み書き回数に制限があります。
 * CacheServiceを用いることでPropertiesServiceの読み書き回数を削減することを目的としています。
 * 
 * CacheServiceのドキュメント
 * https://developers.google.com/apps-script/reference/cache?hl=ja
 * CacheServiceとPropertiesServiceの比較は次のサイトの概要が分かりやすいです。
 * https://qiita.com/golyat/items/ba5d9ce38ec3308d3757
 */
class JsonPropertyCache{
  constructor(keyName){
    this._keyName=keyName;
    this._jsonProperty=new JsonProperty(this._keyName);
    this._cacheService=CacheService.getScriptCache();
    if(null==this._cacheService.get(this._keyName)){
      this._loadFromJsonProperty();
    }
  }
  _loadFromJsonProperty(){
    this._cacheService.put(this._keyName,this._jsonProperty.rawDataStr);
  }
  get isExistData(){
    const cacheRet=this._cacheService.get(this._keyName);
    if (cacheRet==null){
      return this._jsonProperty.isExistData;
    }else{
      return true;
    }
  }
  set rawDataStr(val){
    this._cacheService.put(this._keyName,val);
    this._jsonProperty.rawDataStr=val;
  }
  get rawDataStr(){
    // Logger.log(`JsonPropertyCACHE rawDataStr called ok`);
    const firstCacheRet=this._cacheService.get(this._keyName);
    if(firstCacheRet==null){
      this._loadFromJsonProperty();
      return this._cacheService.get(this._keyName);
    }else{
      return firstCacheRet;
    }
  }
  set data(val){
    this.rawDataStr=JSON.stringify(val);
  }
  get data(){
    return JSON.parse(this.rawDataStr); 
  }
}
function testJsonPropertyCache(){
  const jp=new JsonPropertyCache("testJsonProperty");
  Logger.log(`isExistData :${jp.isExistData}`);
  jp.data={"hel":"cache"};
  Logger.log(`append data`);
  Logger.log(`isExistData :${jp.isExistData}`);
  Logger.log(`rawdataStr :${jp.rawDataStr}`);
  Logger.log(`data[hel] :${jp.data["hel"]}`);
}

/**
 * StatusControlはこのシステム内で「Status」と呼ばれている状態を示すObjectを管理するためのものです。
 * JsonPropertyCacheを内部で使用します。
 */
class StatusControl{
  /**
   * StatusControlのインスタンスを作成します。
   * @param {string} keyName - PropertiesServiceの中で使用するkeyです。
   */
  constructor(keyName){
    this._keyName=keyName;
    this._dataStore=new JsonPropertyCache(this._keyName);
    if(!this._dataStore.isExistData){
      this._dataStore.data={
        "version":1,
      };
      Logger.log(`data reset`);
    }
    const mother=this;
    /**
     * this._WatcherはStatusの変更があるかを監視するクラスです。
     * 親であるStatusControlをmotherでキャプチャーします。
     */
    this._Watcher=class{
      /**
       * @param {number} checkedVersion - 使用主が現在所有するStatusのversion
       */
      constructor(checkedVersion){
        this._mother=mother;
        // this._checkedVersion=this._mother.version;
        Logger.log(`watcher constructor checkedVersion:${checkedVersion}`);
        this._checkedVersion=checkedVersion;
      }
      /**
       * コンストラクタで申告のあったcheckedVersionより新しい場合はtrueを返します。
       * @type {boolean}
       */
      get isChanged(){
        const acquiredVer=this._mother.version;
        const ret=(acquiredVer!=this._checkedVersion);
        this._checkedVersion=acquiredVer;
        return ret;
      }
    }
  }
  /**
   * statusの差分アップデートをします。
   * @param {Object} val - 変更のあったstatus 
   */
  updateStatus(val){
    const currentStatus=this.status;
    // ...はスプレッド構文
    const newStatus={
      ...currentStatus,
      ...val
    }
    return this.status=(newStatus);
  }
  /**
   * statusをセットすることでstatusを完全上書きします。
   * @type {Object} 
   */
  set status(val){
    // Logger.log("called");
    val.version=Math.trunc(this.version+1);
    // Logger.log(`in status val:${val["hel"]}`);
    this._dataStore.data=val;
    return val;
  }
  /**
   * 現行のstatus
   * @type {Object} 
   */
  get status(){
    return this._dataStore.data;
  }
  /**
   * @type {number} 現行のversion
   */
  get version(){
    return Math.trunc(this.status["version"]);
  }
  /**
   * 新しいWatcherインスタンスを作成します。
   * @return {this._Watcher} Watcherインスタンス
   */
  genWatcher(checkedVersion=0){
    return new this._Watcher(checkedVersion);
  }
};

function testStatus(){
  Logger.log(PropertiesService.getScriptProperties().getProperty("jax"));
  Logger.log("hellow");
  statusControl=new StatusControl("statusYtest");
  statusControl.status={"hel":"hello"};
  Logger.log(statusControl.status);
  const watcher=statusControl.genWatcher();
  Logger.log(`isChanged ${watcher.isChanged}`);
  Logger.log(`isChanged ${watcher.isChanged}`);
  Logger.log(`isChanged ${watcher.isChanged}`);
  statusControl.status={"hel":"hello"};
  Logger.log(`isChanged ${watcher.isChanged}`);
}
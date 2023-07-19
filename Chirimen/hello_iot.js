import {requestGPIOAccess} from "./node_modules/node-web-gpio/dist/index.js"; // WebGPIO を使えるようにするためのライブラリをインポート
// import https from 'https';
// import fetch from 'node-fetch';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { requestI2CAccess } = require("node-web-i2c");
const Neopixel = require("@chirimen/neopixel-i2c");
import SHT30 from "@chirimen/sht30";
const sleep = msec => new Promise(resolve => setTimeout(resolve, msec)); // sleep 関数を定義

class LongPolling{
    constructor(url){
        this._url=url;
        this._status={version:0};
        this._sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
        this._timeout_ms=4000;
    }
    async fetchWithTimeout(options,timeout_ms){
        //https://github.com/node-fetch/node-fetch#fetchurl-options
        // console.log(`inFetchWithTimoout :${timeout_ms}`);
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, timeout_ms);
        let data=null;
        try {
            // console.log("try fetch");
            await this._sleep(300);
            const response = await fetch(this._url, {
                signal: controller.signal,
                ...options
            });
            // console.log("end fetch");
            data = await response.text();
        } catch (error) {
            if (error.name==="AbortError") {
                console.log('request was aborted');
            }
        } finally {
            clearTimeout(timeout);
        }
        console.log(`received data: ${data}`);
        return JSON.parse(data);

    }
    async getChange(){
        console.log(`timeout:${this._timeout_ms}ms`);
        const tryTimeout_ms=this._timeout_ms;
        const sendData=JSON.stringify({
            timeout:tryTimeout_ms,
            version:this._status.version
        });
        const data=await this.fetchWithTimeout({
            method:"POST",
            headers:{
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded'
                'Content-Type': 'text/plain',
                // "Authorization": `Bearer ${authToken}`,
                
            },
            body:sendData,
        },tryTimeout_ms+3000);
        if(data===null){
            if(this._timeout_ms>1000){
                this._timeout_ms-=100;
            }
            return null;
        }else{
            this._timeout_ms+=100;
            if(data.ret==="change"){
                this._status=data["status"];
                return this._status;
            }else{
                return null;
            }
        }
    }
}

const gpioAccess = await requestGPIOAccess(); // GPIO を操作する 
const port = gpioAccess.ports.get(26); // 26 番ポートを操作する

await port.export("out"); // ポートを出力モードに設定

const i2cAccess = await requestI2CAccess();
const i2cPort = i2cAccess.ports.get(1);
const neopixel = new Neopixel(i2cPort, 0x41);
await neopixel.init();
const sht30 = new SHT30(i2cPort, 0x44);
await sht30.init();

const selfUrl="https://script.google.com/macros/s/AKfycbxk1teaW2FJHD7_ItuenR8k3vCTp81Zw6YjGpLHUrfSL6hRNKLtYPyShMSs0pNeBWeLgQ/exec";

async function watchSHT30(){
    const queryParams=new URLSearchParams({
        type:"postSHT30"
    });
    let sendStack=[];
    const logSHT30=async()=>{
        // console.log("# sht30 ");
        const { humidity, temperature } = await sht30.readData();
        console.log(`sht30 ${humidity},${temperature}`);
        sendStack.push(JSON.stringify({
            "humidity":humidity,
            "temp":temperature,
            "time":Date.now(),
        }));
    }
    logSHT30();
    setInterval(logSHT30,1000*60);
    (async()=>{
        while(true){
            // console.log("check sendStatck");
            if(sendStack.length>0){
                // console.log("lets send stack[0]");
                const sendData=sendStack[0];
                try{
                    const ret=await fetch(`${selfUrl}?${queryParams}`,{
                        method:"POST",
                        headers:{
                            'Content-Type': 'text/plain',
                        },
                        body:sendData,
                    });
                    if(!ret.ok){
                        throw new Error("not ret.ok");
                    }
                    sendStack.shift();
                }catch(error){
                    console.log("error fail to send SHT30 data");
                    await sleep(1000*30);
                }
            }
            await sleep(1000);
        }
    })();
}

async function listenStatus() {
    
    const queryParams=new URLSearchParams({
        type:"polling"
    });
    const polling=new LongPolling(`${selfUrl}?${queryParams}`);

    // 無限ループ
    for (;;) {
        const newStatus=await polling.getChange();
        console.log(`newStatus:${newStatus}`);
        console.log("hello???");
        if (null!==newStatus){
            if(newStatus.ledRequest!=null){
                if(newStatus.ledRequest){
                    await port.write(1);
                    await neopixel.setGlobal(64, 0, 0); // Red
                }else{
                    await port.write(0);
                    await neopixel.setGlobal(0, 0, 0); // Green
                }
                
            }
        }
    }
}

listenStatus();
watchSHT30();
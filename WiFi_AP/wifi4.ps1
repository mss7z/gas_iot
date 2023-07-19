Add-Type -AssemblyName System.Runtime.WindowsRuntime

#https://superuser.com/questions/1419324/how-to-increase-number-of-devices-on-a-mobile-hotspot
#Portable HotspotをPSで起動する方法は次の解答による
#https://stackoverflow.com/questions/45833873/enable-windows-10-built-in-hotspot-by-cmd-batch-powershell/65912082#65912082

#Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

function Get-AsTask($type){
    #asTaskの解説は https://blog.xin9le.net/entry/2012/11/12/123231 がわかりやすい
    return ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq $type
    })[0]
}
function AwaitOperation($WinRtTask, $ResultType) {
    #C#のgenerics(C++でいうtemplate)で実装されたIAsyncOperationのConcreteなインターフェースを作成しているという解釈
    #MakeGenericMethodはC++のstd::bindに近い（bindと違うのが引数でなくて型引数を与える）
    #元の実装はhttps://fleexlab.blogspot.com/2018/02/using-winrts-iasyncoperation-in.html
    $asTask = (Get-AsTask 'IAsyncOperation`1').MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    Write-Host ($netTask.Result|Out-String)
    return $netTask.Result
}
function AwaitAction($WinRtAction) {
    #元の実装はhttps://stackoverflow.com/questions/45833873/enable-windows-10-built-in-hotspot-by-cmd-batch-powershell/65912082#65912082
    $asTask = Get-AsTask 'IAsyncAction'
    $netTask = $asTask.Invoke($null, @($WinRtAction))
    $netTask.Wait(-1) | Out-Null
}


# https://winscript.jp/powershell/299
#[Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime]とかかなくても
#[Windows.Networking.Connectivity.NetworkInformation]と省略してもいい模様

#[Windows.Networking.NetworkOperators.TetheringWiFiBand]の代わり
$NetworkOperatorTetheringManager=[Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime];
$NetworkInformation=[Windows.Networking.Connectivity.NetworkInformation];
$NetworkOperatorTetheringAccessPointConfiguration=[Windows.Networking.NetworkOperators.NetworkOperatorTetheringAccessPointConfiguration];
$TetheringOperationalState=[Windows.Networking.NetworkOperators.TetheringOperationalState];
enum WifiBand{
    Auto = [Windows.Networking.NetworkOperators.TetheringWiFiBand]::Auto
    TwoPointFourGigahertz = [Windows.Networking.NetworkOperators.TetheringWiFiBand,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::TwoPointFourGigahertz
    FiveGigahertz = [Windows.Networking.NetworkOperators.TetheringWiFiBand,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime]::FiveGigahertz
}

class WifiAP {
    [string]$ssid
    [string]$pass
    [WifiBand]$band
    hidden $connectionProfile
    hidden $tetheringManager
    WifiAP([string]$ssid,[string]$pass,[WifiBand]$band){
        $this.ssid=$ssid
        $this.pass=$pass
        $this.band=$band
        $this.load()
    }
    hidden load(){
        $this.connectionProfile=$script:NetworkInformation::GetInternetConnectionProfile()
        if($null -eq $this.connectionProfile){
            Write-Host 'internet FAIL'
            $connectionProfiles=$script:NetworkInformation::GetConnectionProfiles()
            $this.connectionProfile=$connectionProfiles | Select-Object -First 1
        }else{
            Write-Host 'internet OK'
        }
        $this.tetheringManager=$script:NetworkOperatorTetheringManager::CreateFromConnectionProfile($this.connectionProfile)
        Write-Host 'configured connectionProfile'
        Write-Host ($this.connectionProfile | Out-String)
    }
    [bool]isConfiguredToAP(){
        $c=$this.tetheringManager.GetCurrentAccessPointConfiguration()
        return ($c.Ssid -eq $this.ssid -and $c.Passphrase -eq $this.pass -and $c.Band -eq $this.band)
    }
    configToAP(){
        if(-not $this.isConfiguredToAP()){
            $tetheringConfig= $script:NetworkOperatorTetheringAccessPointConfiguration::new()
            $tetheringConfig.Ssid=$this.ssid
            $tetheringConfig.Passphrase=$this.pass
            $tetheringConfig.Band=$this.band
            AwaitAction ($this.tetheringManager.ConfigureAccessPointAsync($tetheringConfig))
        }
    }
    start(){
        $this.configToAP()
        # Write-Host ($this.tetheringManager.TetheringOperationalState|Out-String)
        if ($this.tetheringManager.TetheringOperationalState -ne $script:TetheringOperationalState::On) {
            Write-Host 'start'
            AwaitOperation ($this.tetheringManager.StartTetheringAsync()) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])
        }
    }
    stop(){
        if ($this.tetheringManager.TetheringOperationalState -ne $script:TetheringOperationalState::Off) {
            Write-Host 'stop'
            AwaitOperation ($this.tetheringManager.StopTetheringAsync()) ([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult])
        }
    }
    
    [object]getClients(){
        return $this.tetheringManager.GetTetheringClients()
    }
};

#SSID PASS BANDを入れる
$wifiAP=[WifiAP]::new("nextAP","next114514",[WifiBand]::TwoPointFourGigahertz)
$wifiAP.start()

"done"
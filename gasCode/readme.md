# あなたのアカウントでこのプログラムを動かす方法

1. グーグルアカウントにログインし、ドライブを開きます
1. 新規スプレッドシートを作成します  
![image](https://github.com/mss7z/gas_iot/assets/49343918/8cca2a36-70a5-4dd2-a7b4-14c91ddc2315)

1. 上部「拡張機能」から「Apps Script」を開きます  
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/a8fce4a0-62a1-450e-bb9d-64b9ee10e7cd)
   ※開かない場合は複数のGoogleアカウントでログインしていることが原因のようです。  
   他のGoogleアカウントからログアウトして試してください。

4. Apps Scriptが開き次の画面になったことを確認してください  
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/e2d6f222-7692-4e8e-8b91-578e45db6164)

5. ここから、コードをコピペしていきます。
   その前に注意すべきことがあります。  
   最初に存在している「コード.gs」を削除すると、デプロイができなくなるバグ？仕様？のようです。
   このことを覚えておいてください。
6. まず、「main.js」を「コード.gs」にコピペして上書きしてください。
   すなわち、最初から存在している内容は削除してください。
   「main.gs」を新規作成すると5で述べた問題が発生します
   Before
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/771a50e5-656b-47c3-9c3b-5060f69b4589)
   After
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/b62d940e-1e2a-47de-8dd1-3db6c0f3297b)

7. これ以降は、新規作成とコピペを繰り返します。
   すべてのファイルをコピペして上書きしてください。
   新規作成
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/5b488fde-12d2-4562-8def-1cc1bcc3d2c5)
   名前の指定
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/b1d3b8b1-821e-45c3-b6bd-b5e574f4e983)
   貼り付け
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/b143e9d4-0bf5-44fe-9705-fe737107bb03)

## 8. 次のファイル構成になっていることを確認します
![image](https://github.com/mss7z/gas_iot/assets/49343918/6f21fbd9-aaf0-425d-bd83-35ef5a4f4368)

## 9. 順番を入れ替えていきます。
「ファイルを下に移動」や「ファイルを上に移動」を用いて変更します。
![image](https://github.com/mss7z/gas_iot/assets/49343918/d1e17c1a-b43c-4786-a492-c75b04afdc68)

最終的に次の順番にしてください
![image](https://github.com/mss7z/gas_iot/assets/49343918/411e7587-cf1d-4a1d-9a7c-a26bcdb58252)

## 10. 青い「デプロイ」ボタンから、「新しいデプロイ」を選択します
![image](https://github.com/mss7z/gas_iot/assets/49343918/d1336cf6-d3fb-4f98-8a34-0db4bfe9a722)


12. 「新しいデプロイ」の画面上で、「種類の選択」から「ウェブアプリ」を開きます
![image](https://github.com/mss7z/gas_iot/assets/49343918/e49c4caa-c027-4202-8dc5-37413561f6a2)

13. 「アクセスできるユーザー」を全員にします。
ここを全員にしないと、認証ができずに、結果的にCORSのエラーが発生し苦しめられます。
学校のアカウントではここで「全員」を選択することができません。
![image](https://github.com/mss7z/gas_iot/assets/49343918/5bf7ce39-ae51-46f1-bd28-570acdc84276)

14. デプロイします。
15. 「アクセスを承認」をクリックします。
    ![image](https://github.com/mss7z/gas_iot/assets/49343918/f11f6118-cde4-4e9e-8390-d5e910f980ee)

16. 「Choose an account」で、プログラムを作成するために使っているアカウントを選択します
![image](https://github.com/mss7z/gas_iot/assets/49343918/d6d49484-6a51-4764-ae84-12c8943b4c5a)

19. おどろおどろしい画面が出ますが、「Advanced」をクリックします
![image](https://github.com/mss7z/gas_iot/assets/49343918/563ae7e8-7a2d-43fe-81b0-4a6507ea714f)


20. 「Go to 無題のプロジェクト(unsafe)」をクリックします。すでに、プロジェクト名を変更している場合は別の名前が出ています
![image](https://github.com/mss7z/gas_iot/assets/49343918/80160012-b43d-4ae4-b6bc-1431f23d0caf)

21. 「Allow」をクリックします
![image](https://github.com/mss7z/gas_iot/assets/49343918/4855bdeb-ee09-4a37-93ee-0e5cf469436c)

22. 次の画面に遷移するので、URLをクリックしてみます
![image](https://github.com/mss7z/gas_iot/assets/49343918/07acd2bf-e4d6-422f-a59b-f6d19535ce74)

23. 次のようにウェブアプリが開きます
![image](https://github.com/mss7z/gas_iot/assets/49343918/4333769d-2a93-4d00-89eb-35b017472d80)


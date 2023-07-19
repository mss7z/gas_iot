# あなたのアカウントでこのプログラムを動かす方法

1. グーグルアカウントにログインし、ドライブを開きます
2. 新規スプレッドシートを作成します
![image](https://github.com/mss7z/gas_iot/assets/49343918/8cca2a36-70a5-4dd2-a7b4-14c91ddc2315)

3. 上部「拡張機能」から「Apps Script」を開きます
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
   すなわち、最初から存在しているmyFunction関数は削除してください。
   「main.gs」を新規作成すると5で述べた問題が発生します
   Before
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/771a50e5-656b-47c3-9c3b-5060f69b4589)
   After
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/b62d940e-1e2a-47de-8dd1-3db6c0f3297b)

7. これ以降は、新規作成とコピペを繰り返します。
   すべてのファイルをコピペしてください。
   新規作成
  ![image](https://github.com/mss7z/gas_iot/assets/49343918/5b488fde-12d2-4562-8def-1cc1bcc3d2c5)
  名前の指定
![image](https://github.com/mss7z/gas_iot/assets/49343918/b1d3b8b1-821e-45c3-b6bd-b5e574f4e983)
   貼り付け
   ![image](https://github.com/mss7z/gas_iot/assets/49343918/b143e9d4-0bf5-44fe-9705-fe737107bb03)

9. 

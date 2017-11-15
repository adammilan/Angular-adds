md "c:\data\"
md "c:\data\db"
start C:\Program Files\MongoDB\Server\3.4\bin\mongod 
start mongoimport -d KobiMorAfek -c messages messages.json
start node test.js
start chrome http://127.0.0.1:8080/screen=2
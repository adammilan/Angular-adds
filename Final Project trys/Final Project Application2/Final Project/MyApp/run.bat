md "c:\data\"
md "c:\data\db"
start mongod 
start mongoimport -d EladGuy -c Messages Messages.json
start node test.js
start chrome http://127.0.0.1:8080/screen=2
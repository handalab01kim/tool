Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\{username}\repositories\db_tables"
WshShell.Run "cmd.exe /C set TZ=Asia/Seoul && npx nodemon server.js", 0, False

' WshShell.Run "npx nodemon server.js", 0, False
' WshShell.Run "cmd /c node path\to\my\server.js", 0, False
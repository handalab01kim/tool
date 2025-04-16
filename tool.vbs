Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c npx nodemon server.js", 0, False
' WshShell.Run "cmd /c node path\to\my\server.js", 0, False
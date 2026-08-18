' Starts Laravel (port 505) and Vite (5051) as hidden, detached background processes.
Set ws = CreateObject("WScript.Shell")
ws.CurrentDirectory = "D:\Project\web - projekk"
ws.Run """C:\php\php.exe"" artisan serve --host=0.0.0.0 --port=505", 0, False
ws.Run "cmd /c npm run dev", 0, False
ws.Run """C:\php\php.exe"" artisan schedule:work", 0, False

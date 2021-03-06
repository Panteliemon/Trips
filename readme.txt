===== Поездочки web site =====

----------- Development Tools -----------
1. MS Visual Studio Community 2019
2. Visual Studio Code
3. Angular stuff https://angular.io/guide/setup-local
4. Any MS SQL management tools (those from MS Visual Studio will be enough)

----------- Folders -----------
trips-client
  Root folder for Angular app - client side. This is also root folder for VS Code.
TripsServer
  Directory with MS Visual Studio solution for server app.

----------- Setup Development Environment -----------
Note that VS Code doesn't support spaces in path to the root directory of project,
so make sure the root is mapped to some destination without spaces in path.

1. Create local MS SQL database in standalone *.mdf file. The database should use
Windows authentication. You can change this setting, however, in that case you will have
to amend not only configuration files, but the app code as well. In such case, this guide
will not help you. It's for you to choose: to follow these instructions, or to setup
everything on your own.
Suggested folder for the DB: TripsServer/Database, since it's already included to gitignore.

2. Create folder for storing pictures. This folder will grow as rapidly as you will
upload pictures to your locally running app. The folder should be initially empty and
not be used for any other purposes in order to avoid conflicts.

3. In TripsServer/Trips/dbconfig.xml change the following parameters:
UseRemote: false
LocalServerName: to whatever is your local MS SQL Server service name (you can take it
  from your DB's connection string)
LocalTripsPath: full path to *.mdf file of your local "Trips" DB.
PicsStorageFolder: full path to the folder you created for pictures, without trailing slash.

4. In TripsServer/Trips:
Create empty file "keys.xml". This is needed for the first build only.

5. In TripsServer/Trips/Program.cs:
Uncomment the line "Config.Keys.CreateExample();", then launch the app in debug mode,
make this line execute, then stop the app, and comment the line back.
You will get "keys.example.xml" file in the TripsServer/Trips folder. Delete the empty "keys.xml"
and rename "keys.example.xml" to "keys.xml"
Inside the keys.xml: specify there whatever keys you want, or leave default.

6. Create tables in database. Execute the following line in NuGet Package Manager Console:
update-database

Don't forget to disconnect from your newly created DB before that, because for some reason
it causes conflict and NuGet cannot modify the database.

Win7 note: if you don't have certain Win7 updates installed, NuGet will fail to execute this
command with no description what the error was about. To fix this you must update PowerShell.
Google how to do this.

7. Launch server app in Debug mode. You can use "/ping" endpoint to check that DB connection works well.

8. In trips-client: execute npm install

9. In trips-client/src/app/services/api.ts:
Change the predefined API path to the address your server app started on.
Change the PICS path: comment the "production version" and uncomment the "localhost version" (maybe change port).
Then start the Angular app ("ng serve" or trips-client/run.bat).
If the Angular app for some reason started not on the localhost:4200, you should stop the server app
and change ClientUrl value in Program.cs (sorry, didn't make it via config), then rerun server app.

10. On running client app, go to login (upper right corner) and try to log in with username "bn"
and empty password. The app responds "Пользователь bn не найден" (User bn not found) - it's ok.
Now try to login as bn again and use the AppDefaultUserPassword value from TripsServer/Trips/keys.xml
as password.

11. You're in! Congratulations. Start to add data.
# InteractINSA
Modules à installer pour Python:
-Flask
-flask_cors
-sqlachemy
-flask_socketio
-qrcode
-uuid

Celle de React:
-react-router-dom
-react-modal
-react-toastify


Il faut changer l'adresse IP dans les fichiers Home.js, Student.js, package.json et server.py(dans la ligne d'exécution de app et la ligne du code QR) par celle de votre machine. Il faut changer les données de la base de données dans le fichier server.py. Ensuite créer la base de données. Pour créer les tables, il faut lancer python3 dans le dossier falsk-server et entrer les commandes suivantes: 
-from server import db,app 
-with app.app_context(): 
      db.create_all()

Pour executer le code. Après il faut aller au dossier du serveur (Flask-server) et taper les commandes suivantes : -source venv/bin/activate -python3 server.py Il faut ensuite ouvrir un autre terminal et aller sur le dossier du client et taper la commande suivante : npm start

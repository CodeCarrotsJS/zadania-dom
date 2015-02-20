var ws = require('websocket.io'),
	server = ws.listen(3000),
	connections = [];

console.log('Gniazdo nasłuchuje na porcie 3000.');

server.on('connection', function (socket) {
	console.log('Nowe połączenie.');

	connections.forEach(function (connection) {
		connection.send(JSON.stringify({
			message: 'connection'
		}));
	});

	connections.push(socket);

	socket.on('message', function (message) {
		var data;
		console.log(message);
		try {
			data = JSON.parse(message);
		} catch(e) {
			console.log('Niepoprawne dane.');
			return;
		}

		if (data.message) {
			console.log('Wiadomość otrzymana: ' + data.message + '".');

			connections.forEach(function (connection) {
				connection.send(JSON.stringify({
					message: data.message
				}));
			});
		}
	});

	socket.on('close', function () {
		var socketIndex = connections.indexOf(socket);

		connections.splice(socketIndex, 1);
	});
});
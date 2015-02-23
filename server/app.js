var ws = require('websocket.io'),
	_ = require('lodash'),
	server = ws.listen(3000),
	connections = [],
	id = 0;

console.log('Gniazdo nasłuchuje na porcie 3000.');

server.on('connection', function (socket) {
	socket.id = ++id;

	console.log('Nowe połączenie.');

	broadcast({
		id: socket.id,
		message: 'connection'
	});

	connections.push(socket);

	socket.send(JSON.stringify({
		message: 'connections',
		data: _.map(connections, function(connection) {
			return _.pick(connection, 'id', 'nickname');
		}),
		myId: socket.id
	}));

	socket.on('message', function (message) {
		var data;
		console.log(message);
		try {
			data = JSON.parse(message);
		} catch(e) {
			console.log('Niepoprawne dane.');
			return;
		}

		if (data.nickname) {
			socket.nickname = data.nickname;

			broadcast({
				id: socket.id,
				nickname: data.nickname
			});
		}

		if (data.message) {
			console.log('Wiadomość otrzymana: ' + data.message + '".');

			broadcast({ message: data.message, data: data.data || {} });
		}
	});

	socket.on('close', function () {
		var socketIndex = connections.indexOf(socket);

		connections.splice(socketIndex, 1);

		broadcast({ message: 'disconnected', id: socket.id });
	});
});

function broadcast( msg ) {
	connections.forEach(function (connection) {
		connection.send(JSON.stringify(msg));
	});
}
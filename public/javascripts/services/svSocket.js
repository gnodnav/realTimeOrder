var app = angular.module("app");
app.factory('svSocket', function (socketFactory) {
	var socketConnection = io.connect('http://192.168.1.5:8000');
	var socket = socketFactory({
		ioSocket: socketConnection
	});
	return socket;
});
//, { reconnect: true }
var app = angular.module("app");
app.factory('svSocket', function (socketFactory) {
	var socketConnection = io.connect('http://10.40.65.42:9000', { reconnect: true });
	var socket = socketFactory({
		ioSocket: socketConnection
	});
	return socket;
});
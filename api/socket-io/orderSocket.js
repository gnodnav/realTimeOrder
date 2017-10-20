module.exports = function (io) {
	var client = [];
	var employee = [];
	var _administrator = {};

	io.on('connection', function (socket) {
		socket.on('newUser', function (info) {

			if (info) {
				socket.authorities = info.authorities;
				socket.room = info.room;
				socket.EmplID = info.id;
				client.push(socket);
				if (JSON.stringify(employee).indexOf(JSON.stringify(info), 0) == -1)
					employee.push(info);
			}

			if (socket.authorities === 'Administrator')
				_administrator = socket;

			if (io.sockets.connected[_administrator.id])
				io.sockets.connected[_administrator.id].emit('viewEmployeeOnline', employee)
		})
		socket.on('disconnect', function (data) {
			if (client.indexOf(socket) != -1) {
				employee.splice(client.indexOf(socket), 1);
				client.splice(client.indexOf(socket), 1);
			}
			if (io.sockets.connected[_administrator.id])
				io.sockets.connected[_administrator.id].emit('viewEmployeeOnline', employee)

		});
		socket.on('create_order', function (data) {
			client.forEach(function (_socket) {
				if (_socket.id !== socket.id) {
					switch (_socket.authorities) {
						case 'Admin':
						case 'Manager':
							if (_socket.room == data.ChildDepartment) {
								if (io.sockets.connected[_socket.id]) {
									io.sockets.connected[_socket.id].emit('viewCreateOrder', data);
								}
							}
							break;
						case 'Administrator':
							if (io.sockets.connected[_socket.id]) {
								io.sockets.connected[_socket.id].emit('viewCreateOrder', data);
							}
							break;
						default:
							break;
					}
				}
			}, this);
		});
		socket.on('approveOrder', function (data) {
			client.forEach(function (_socket) {
				if (_socket.id !== socket.id) {
					switch (_socket.authorities) {
						case 'Admin':
						case 'Manager':
							if (_socket.room == data.ChildDepartment)
								if (io.sockets.connected[_socket.id]) {
									data.approve = true;
									data.status = 'Pending';
									io.sockets.connected[_socket.id].emit('viewApprove', data);
								}
							break;
						case 'Administrator':
							if (io.sockets.connected[_socket.id]) {
								data.approve = true;
								data.status = 'Pending';
								io.sockets.connected[_socket.id].emit('viewApprove', data);
							}
							break;
						case 'POM':
							if (io.sockets.connected[_socket.id]) {
								data.approve = true;
								data.status = 'Pending';
								io.sockets.connected[_socket.id].emit('viewApprove', data);
							}
							break;
						case 'AM':
							if (_socket.EmplID == data.EmplID)
								if (io.sockets.connected[_socket.id]) {
									data.approve = true;
									data.status = 'Pending';
									io.sockets.connected[_socket.id].emit('viewApprove', data);
								}
							break;
						default:
							break;
					}
				}
			}, this);
		})
		socket.on('updateOrder', function (data) {



			client.forEach(function (_socket) {
				if (_socket.id !== socket.id) {
					switch (_socket.authorities) {
						case 'POM':
						case 'Administrator':
							if (io.sockets.connected[_socket.id]) {
								io.sockets.connected[_socket.id].emit('viewCreateOrder', data);
							}
							break;
						case 'Admin':
						case 'Manager':
							if (_socket.room == data.ChildDepartment) {
								if (io.sockets.connected[_socket.id]) {
									io.sockets.connected[_socket.id].emit('viewCreateOrder', data);
								}
							}
							break;
						default:
							if (_socket.EmplID == data.EmplID) {
								if (io.sockets.connected[_socket.id]) {
									io.sockets.connected[_socket.id].emit('viewCreateOrder', data);
								}
							}
							break;
					}
				}
			}, this);
		})
		socket.on('jaja', function () {
			//	console.log(client.length);
		})

	});
}
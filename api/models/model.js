var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var employeeSchema = new Schema({
	EmplID: Number,
	EmplRcd: String,
	Name: String,
	ChildDepartment: String,
	OfficerCode: String,
	JobTitle: String,
	Mail: String,
	authorities: String
}, { collection: 'employee' });

var accountSchema = new Schema({
	EmplID: Number,
	Username: String,
	Password: String,
	authorities: String
}, { collection: 'account' });

var orderSchema = new Schema({
	EmplID: Number,
	poNumber: String,
	ChildDepartment: String,
	type: String,
	Warehouse: String,
	customerName: String,
	customerAddress: String,
	approve: Boolean,
	datetime: String,
	products: [{
		pnNumber: String,
		name: String,
		frequency: String,
		unitPrice: String,
		price: String,
		NCCDN: String,
		priceTT: String,
		NCCTT: String,
		CQ_CO: String,
		note: String
	}],
	status: String,
	branch: String,
	notePOM: String,
	totalPrice: String
}, { collection: 'order' })

var fileUploadSchema = new Schema({
	poNumber: String,
	files: []
}, { collection: 'file' })


var permissionsSchema = new Schema({
	view: String,
	approve: Boolean,
	edit: Boolean
})
var nccSchema = new Schema({
	pnNumber: String,
	name: String,
	NCCDN: String,
	unitPrice: String,
	check: Boolean
}, { collection: 'ncc' })
var CustomerSchema = new Schema({
	customerID: String,
	name: String,
	address: String,
	sdt: String,
	mail: String
}, { collection: 'customer' })


var account = mongoose.model("account", accountSchema);
var employee = mongoose.model("employee", employeeSchema);
var order = mongoose.model("order", orderSchema);
var file = mongoose.model('file', fileUploadSchema);
var ncc = mongoose.model('ncc', nccSchema);
var customer = mongoose.model('customer', CustomerSchema);

module.exports = {
	account: account,
	employee: employee,
	order: order,
	file: file,
	ncc: ncc,
	customer: customer
}

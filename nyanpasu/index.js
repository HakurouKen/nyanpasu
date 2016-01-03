var Redis = require('ioredis');

var redis = new Redis(),
	nyanpasu = module.exports = {};

function type(o){
	return Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
}

function dbOperation(oper,params,callback){
	callback = type(callback) === 'function' ? callback : null;
	params = params || [];
	params = type(params) === 'array' ? params : [params];

	if(callback){
		params.push(callback);
	}

	return redis[oper].apply(redis,params);
}

nyanpasu.inc = function(callback){
	return dbOperation('incr','nyanpasu',callback);
}

nyanpasu.get = function(callback){
	return dbOperation('get','nyanpasu',callback);
}